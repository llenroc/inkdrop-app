const InkDrop = artifacts.require('InkDrop')

contract('InkDrop (follower functions)', async accounts => {
  before('initial setup with user creation', async () => {
    let inkdropInstance = await InkDrop.deployed()
    await inkdropInstance.createUser('testuser5', 'testbio', 'testhash', { from: accounts[5] })
    await inkdropInstance.createUser('testuser6', 'testbio', 'testhash', { from: accounts[6] })
    await inkdropInstance.createUser('testuser7', 'testbio', 'testhash', { from: accounts[7] })
  })

  it('...follow user', async () => {
    let inkdropInstance = await InkDrop.deployed()
    await inkdropInstance.followUser(accounts[6], { from: accounts[5] })
    let user = await inkdropInstance.getUser(accounts[5])
    assert.equal(user[4].toNumber(), 1, 'The should have 1 followers.')
    let followers = await inkdropInstance.getUserFollowers(accounts[5])
    assert.equal(followers[0], accounts[6], 'The follower addresses should be the same.')
  })

  it('...follow user extended', async () => {
    let inkdropInstance = await InkDrop.deployed()
    await inkdropInstance.followUser(accounts[5], { from: accounts[7] })
    let user = await inkdropInstance.getUser(accounts[7])
    assert.equal(user[4].toNumber(), 1, 'The should have 1 followers.')
    let followers = await inkdropInstance.getUserFollowers(accounts[7])
    assert.equal(followers[0], accounts[5], 'The follower addresses should be the same.')
    await inkdropInstance.followUser(accounts[6], { from: accounts[7] })
    user = await inkdropInstance.getUser(accounts[7])
    assert.equal(user[4].toNumber(), 2, 'The should now have 2 followers.')
    followers = await inkdropInstance.getUserFollowers(accounts[7])
    assert.equal(followers.length, 2, 'The follower array should now have length 2.')
    assert.equal(followers[1], accounts[6], 'The follower addresses should be the same.')
  })

  it('...follow user twice', async () => {
    let inkdropInstance = await InkDrop.deployed()
    try {
      await inkdropInstance.followUser(accounts[6], { from: accounts[5] })
      assert.fail('Should throw error.')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0
      assert.equal(revertFound, true, `Expected "revert", got ${error} instead`)
    }
  })

  it('...follow user from not a valid user', async () => {
    let inkdropInstance = await InkDrop.deployed()
    try {
      await inkdropInstance.followUser(accounts[5], { from: accounts[8] })
      assert.fail('Should throw error.')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0
      assert.equal(revertFound, true, `Expected "revert", got ${error} instead`)
    }
  })

  it('...follow user that does not exist', async () => {
    let inkdropInstance = await InkDrop.deployed()
    try {
      await inkdropInstance.followUser(accounts[8], { from: accounts[5] })
      assert.fail('Should throw error.')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0
      assert.equal(revertFound, true, `Expected "revert", got ${error} instead`)
    }
  })

  it('...follow a user itself', async () => {
    let inkdropInstance = await InkDrop.deployed()
    try {
      await inkdropInstance.followUser(accounts[6], { from: accounts[6] })
      assert.fail('Should throw error.')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0
      assert.equal(revertFound, true, `Expected "revert", got ${error} instead`)
    }
  })

  it('...unfollow user', async () => {
    let inkdropInstance = await InkDrop.deployed()
    let user = await inkdropInstance.getUser(accounts[5])
    assert.equal(user[4].toNumber(), 1, 'The should have 1 followers.')
    await inkdropInstance.unfollowUser(accounts[6], { from: accounts[5] })
    user = await inkdropInstance.getUser(accounts[5])
    assert.equal(user[4].toNumber(), 0, 'The user should have 0 followers.')
    let followers = await inkdropInstance.getUserFollowers(accounts[5])
    assert.equal(followers.length, 0, 'The follower addresses array should have length 0.')
  })

  it('...unfollow user extended', async () => {
    let inkdropInstance = await InkDrop.deployed()
    let user = await inkdropInstance.getUser(accounts[7])
    assert.equal(user[4].toNumber(), 2, 'The should have 2 followers.')
    await inkdropInstance.unfollowUser(accounts[5], { from: accounts[7] })
    user = await inkdropInstance.getUser(accounts[7])
    assert.equal(user[4].toNumber(), 1, 'The should have 1 followers.')
    let followers = await inkdropInstance.getUserFollowers(accounts[7])
    assert.equal(followers[0], accounts[6], 'The follower addresses should be the same.')
    await inkdropInstance.unfollowUser(accounts[6], { from: accounts[7] })
    user = await inkdropInstance.getUser(accounts[7])
    assert.equal(user[4].toNumber(), 0, 'The should now have 0 followers.')
    followers = await inkdropInstance.getUserFollowers(accounts[7])
    assert.equal(followers.length, 0, 'The follower array should now have length 0.')
  })

  it('...unfollow from a user with no followers', async () => {
    let inkdropInstance = await InkDrop.deployed()
    let user = await inkdropInstance.getUser(accounts[5])
    assert.equal(user[4].toNumber(), 0, 'The should have 0 followers.')
    try {
      await inkdropInstance.unfollowUser(accounts[6], { from: accounts[5] })
      assert.fail('Should throw error.')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0
      assert.equal(revertFound, true, `Expected "revert", got ${error} instead`)
    }
  })

  it('...unfollow a user twice', async () => {
    let inkdropInstance = await InkDrop.deployed()
    await inkdropInstance.followUser(accounts[5], { from: accounts[6] })
    let user = await inkdropInstance.getUser(accounts[6])
    assert.equal(user[4].toNumber(), 1, 'The should have 1 followers.')
    await inkdropInstance.unfollowUser(accounts[5], { from: accounts[6] })
    user = await inkdropInstance.getUser(accounts[6])
    assert.equal(user[4].toNumber(), 0, 'The should have 0 followers.')
    try {
      await inkdropInstance.unfollowUser(accounts[5], { from: accounts[6] })
      assert.fail('Should throw error.')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0
      assert.equal(revertFound, true, `Expected "revert", got ${error} instead`)
    }
  })

  it('...unfollow a user itself', async () => {
    let inkdropInstance = await InkDrop.deployed()
    try {
      await inkdropInstance.unfollowUser(accounts[6], { from: accounts[6] })
      assert.fail('Should throw error.')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0
      assert.equal(revertFound, true, `Expected "revert", got ${error} instead`)
    }
  })
})
