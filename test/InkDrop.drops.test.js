const InkDrop = artifacts.require('InkDrop')

contract('InkDrop (drop functions)', async accounts => {
  before('initial setup with user creation', async () => {
    let inkdropInstance = await InkDrop.deployed()
    await inkdropInstance.createUser('testuser7', 'testbio', 'testhash', { from: accounts[7] })
    await inkdropInstance.createUser('testuser8', 'testbio', 'testhash', { from: accounts[8] })
    await inkdropInstance.createUser('testuser9', 'testbio', 'testhash', { from: accounts[9] })
  })

  it('...drop message with minimum amount', async () => {
    let inkdropInstance = await InkDrop.deployed()
    await inkdropInstance.createMessage('Hello world', 0, { from: accounts[9] })
    let count = await inkdropInstance.getMessageCount()
    assert.equal(count.toNumber(), 1, 'There should me now 1 message.')
    let user = await inkdropInstance.getUser(accounts[9])
    assert.equal(user[5].length, 1, 'The user should have as well 1 message.')
    await inkdropInstance.dropMessage(0, { from: accounts[7], value: 1000000000000000 })

    msg = await inkdropInstance.getMessage(0, { from: accounts[8] })
    assert.equal(
      msg[5].toNumber(),
      1000000000000000,
      'The message should have 1000000000000000 wei.'
    )
  })

  it('...check payout of drops in wei to author', async () => {
    let inkdropInstance = await InkDrop.deployed()
    user = await inkdropInstance.getUser(accounts[9])
    assert.equal(
      user[2].toNumber(),
      1000000000000000 / 2,
      'The author of the message should get 50% of the weis.'
    )
  })

  it('...drop message with uneven amount and check payout', async () => {
    let inkdropInstance = await InkDrop.deployed()
    await inkdropInstance.createMessage('Hello world2', 0, { from: accounts[7] })
    await inkdropInstance.dropMessage(1, { from: accounts[9], value: 1000000000000001 })

    user = await inkdropInstance.getUser(accounts[7])
    assert.equal(
      user[2].toNumber(),
      Math.floor(1000000000000001 / 2),
      'The author of the message should get 50% of the weis minus remainer.'
    )
  })

  it('...drop message with too little amount', async () => {
    let inkdropInstance = await InkDrop.deployed()

    try {
      await inkdropInstance.dropMessage(0, { from: accounts[7], value: 100000000000000 })
      assert.fail('Should throw error.')
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0
      assert.equal(revertFound, true, `Expected "revert", got ${error} instead`)
    }
  })
})
