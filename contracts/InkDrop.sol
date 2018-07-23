pragma solidity ^0.4.23;

import "openzeppelin-zos/contracts/ownership/Ownable.sol";
import "openzeppelin-zos/contracts/lifecycle/Pausable.sol";
import "openzeppelin-zos/contracts/math/SafeMath.sol";

contract InkDrop is Ownable, Pausable {

  using SafeMath for uint256;

  uint MULTIPLIER = 100;

  struct data {
    uint value;
    bool isSet;
  }

  struct User {
    bytes32 username;
    string bio;
    string ipfsHash;
    uint index;
    // uint followers;
    // User has many followers
    address[] followers; 
    mapping(address => data) followerPointers;
    // messages of a user
    uint[] messages;
    mapping(uint => uint) messagePointers;
    // total drop points
    uint dropAmount;
    // drops of a user
    // uint[] drops;
    // mapping(uint => uint) dropPointers;
  }
  
  mapping(address => User) private userStructs;
  address[] private userList;

    // The structure of a message
  struct Message {
    uint id;
    uint parent;
    string content;
    address writtenBy;
    uint timestamp;
    uint timetolive;
    // addresses of users' likes
    address[] likes;
    // mapping of message id to position in likes array
    mapping(address => data) likePointers;
    // total drop points
    uint dropAmount;
    // addresses of users' drops
    address[] drops;
    // mapping of message id to position in drops array
    mapping(address => data) dropPointers;
    uint[] comments;
  }
  
  // mapping(uint => Message) private messageStructs;
  Message[] private messageList;
  Message[] private commentList;

  event LogNewUser   (address indexed userAddress, uint index, bytes32 username, string bio, string ipfsHash);
  event LogUpdateUser(address indexed userAddress, uint index, bytes32 username, string bio, string ipfsHash);
  event LogDeleteUser(address indexed userAddress, uint index);

  function initialize() isInitializer("InkDrop", "0") public {
  }
  
  function isUser(address _userAddress) public view returns(bool isIndeed) {
     // if the list is empty, the requested user is not present
    if(userList.length == 0) return false;
    // true = exists
    return (userList[userStructs[_userAddress].index] == _userAddress);
  }

  function isValidName(bytes32 _username) private pure returns(bool isValid) {
    return (!(_username == 0x0));
  }

  function isMessage(uint _parent) public view returns(bool isIndeed) {
     // if the list is empty, the requested message is not present
    if(messageList.length == 0) return false;
    // true = exists
    return (messageList.length > _parent);
  }

  function getUserCount() public constant returns(uint count) {
    return userList.length;
  }

  function getUserAtIndex(uint _index) public constant returns(address userAddress) {
    require(_index <= userList.length);
    return userList[_index];
  }
  
  function getUser(address _userAddress) public constant returns(bytes32 username, string bio, uint drops, string ipfsHash, uint followers, uint[] messages) {
    require(isUser(_userAddress)); 
    return (userStructs[_userAddress].username, userStructs[_userAddress].bio, 
      userStructs[_userAddress].dropAmount, userStructs[_userAddress].ipfsHash, 
      userStructs[_userAddress].followers.length, userStructs[_userAddress].messages);
  } 

  function getUserFollowers(address _userAddress) public constant returns(address[] followers) {
    require(isUser(_userAddress)); 
    return userStructs[_userAddress].followers;
  } 
  
  function createUser(bytes32 _username, string _bio, string _ipfsHash) whenNotPaused public payable returns(uint index) {
    require(!isUser(msg.sender)); 
    require(isValidName(_username));
    
    userStructs[msg.sender].username = _username;
    userStructs[msg.sender].bio = _bio;
    userStructs[msg.sender].ipfsHash = _ipfsHash;
    // each new user gets 10 drops initially
    userStructs[msg.sender].dropAmount = 10*MULTIPLIER;
    userStructs[msg.sender].index = userList.push(msg.sender) - 1;
    emit LogNewUser(msg.sender, userStructs[msg.sender].index, _username, _bio, _ipfsHash);
    return userList.length - 1;
  }

  function deleteUser() whenNotPaused public payable returns(uint index) {
    require(isUser(msg.sender)); 
    // this would break referential integrity
    // require(userStructs[msg.sender].messageIds.length <= 0);
    uint rowToDelete = userStructs[msg.sender].index;
    address keyToMove = userList[userList.length-1];
    userList[rowToDelete] = keyToMove;
    userStructs[keyToMove].index = rowToDelete; 
    userList.length--;
    emit LogDeleteUser(msg.sender, rowToDelete);
    emit LogUpdateUser(keyToMove, rowToDelete, userStructs[keyToMove].username, userStructs[keyToMove].bio, userStructs[keyToMove].ipfsHash);
    return rowToDelete;
  }
  
  function updateUserIpfsHash(string _ipfsHash) whenNotPaused public payable returns(bool success) {
    require(isUser(msg.sender)); 
    require(bytes(_ipfsHash).length > 0);

    userStructs[msg.sender].ipfsHash = _ipfsHash;
    emit LogUpdateUser(msg.sender, userStructs[msg.sender].index, userStructs[msg.sender].username, userStructs[msg.sender].bio, _ipfsHash);
    return true;
  }

  function updateUserBio(string _bio) whenNotPaused public payable returns(bool success) {
    require(isUser(msg.sender)); 
    require(bytes(_bio).length > 0);

    userStructs[msg.sender].bio = _bio;
    emit LogUpdateUser(msg.sender, userStructs[msg.sender].index, userStructs[msg.sender].username, _bio, userStructs[msg.sender].ipfsHash);
    return true;
  }

  function updateUsername(bytes32 _username) whenNotPaused public payable returns(bool success) {
    require(isUser(msg.sender)); 
    require(isValidName(_username));

    userStructs[msg.sender].username = _username;
    emit LogUpdateUser(msg.sender, userStructs[msg.sender].index, _username, userStructs[msg.sender].bio, userStructs[msg.sender].ipfsHash);
    return true;
  }

  function updateUser(bytes32 _username, string _bio, string _ipfsHash) whenNotPaused public payable returns(bool success) {
    require(isUser(msg.sender)); 
    require(isValidName(_username));
    require(bytes(_bio).length > 0);
    require(bytes(_ipfsHash).length > 0);

    userStructs[msg.sender].username = _username;
    userStructs[msg.sender].bio = _bio;
    userStructs[msg.sender].ipfsHash = _ipfsHash;
    emit LogUpdateUser(msg.sender, userStructs[msg.sender].index, _username, _bio, _ipfsHash);
    return true;
  }
  
  function followUser(address _user) whenNotPaused public payable returns(uint followers) {
    require(isUser(_user));
    require(isUser(msg.sender));
    require(!(msg.sender == _user));
    // require that a user can not follow a user twice
    require(!userStructs[msg.sender].followerPointers[_user].isSet);

    userStructs[msg.sender].followerPointers[_user].value = userStructs[msg.sender].followers.push(_user) - 1;
    userStructs[msg.sender].followerPointers[_user].isSet = true;
    return userStructs[msg.sender].followers.length;
  }
  
  function unfollowUser(address _user) whenNotPaused public payable returns(uint followers) {
    require(isUser(_user));
    require(isUser(msg.sender));
    require(!(msg.sender == _user));
    require(userStructs[msg.sender].followers.length > 0);
    // require that a user can not unfollow a user twice
    require(userStructs[msg.sender].followerPointers[_user].isSet);
    // delete user
    uint rowToDelete = userStructs[msg.sender].followerPointers[_user].value;
    address keyToMove = userStructs[msg.sender].followers[userStructs[msg.sender].followers.length-1];
    userStructs[msg.sender].followers[rowToDelete] = keyToMove;
    userStructs[msg.sender].followerPointers[keyToMove].value = rowToDelete; 
    userStructs[msg.sender].followerPointers[_user].isSet = false;
    return --userStructs[msg.sender].followers.length;
  }

  function getMessageCount() public constant returns(uint count) {
    return messageList.length;
  }

  // The stack can only be 7 steps deep - only 7 return values allowed
  function getMessage(uint _id) public constant returns(string content, address writtenBy, uint timestamp, uint timetolive, uint likes, uint drops, uint[] comments) {
    require(_id < messageList.length);
    return (messageList[_id].content, messageList[_id].writtenBy, messageList[_id].timestamp, messageList[_id].timetolive, 
      messageList[_id].likes.length, messageList[_id].dropAmount, messageList[_id].comments);
  }
  

  function createMessage(string _content, int _dropAmount) whenNotPaused public payable returns(uint index) {
    require(isUser(msg.sender));
    require(bytes(_content).length > 0);
    require(_dropAmount >= 0);
    require(userStructs[msg.sender].dropAmount >= uint(_dropAmount)*MULTIPLIER);

    uint256 msgId = messageList.length;
    Message memory message;
    // = Message(_content, msg.sender, now, 0, 0, msgId, -1, comments);
    message.content = _content;
    message.writtenBy = msg.sender;
    message.timestamp = now;
    // Compute TTL according to function
    message.timetolive = now;
    message.id = msgId;
    message.dropAmount = uint(_dropAmount)*MULTIPLIER;
    userStructs[msg.sender].messagePointers[userStructs[msg.sender].messages.push(msgId)-1] = msgId;
    messageList.push(message);
    messageList[messageList.length-1].dropPointers[msg.sender].value = messageList[messageList.length-1].drops.push(msg.sender) - 1;
    messageList[messageList.length-1].dropPointers[msg.sender].isSet = true;
    // reduce the sender's dropAmount
    userStructs[msg.sender].dropAmount -= (uint(_dropAmount)*MULTIPLIER);
    // emit MessageSend(msg.sender, userInfo[msg.sender].name, msgId);
    return messageList.length;
  }

  function likeMessage(uint _id) whenNotPaused public payable returns(uint newlikes) {
    require(isUser(msg.sender));
    require(_id < messageList.length);
    // require that a user can not like a message twice
    require(!messageList[_id].likePointers[msg.sender].isSet);

    messageList[_id].likePointers[msg.sender].value = messageList[_id].likes.push(msg.sender) - 1;
    messageList[_id].likePointers[msg.sender].isSet = true;
    // TODO: prolongue timetolive
    return messageList[_id].likes.length;
  }

  function unlikeMessage(uint _id) whenNotPaused public payable returns(uint newlikes) {
    require(isUser(msg.sender));
    require(_id < messageList.length);
    require(messageList[_id].likes.length > 0);
    // require that a user can not unlike a message twice
    require(messageList[_id].likePointers[msg.sender].isSet);

    uint rowToDelete = messageList[_id].likePointers[msg.sender].value;
    address keyToMove = messageList[_id].likes[messageList[_id].likes.length-1];
    messageList[_id].likes[rowToDelete] = keyToMove;
    messageList[_id].likePointers[keyToMove].value = rowToDelete; 
    messageList[_id].likePointers[msg.sender].isSet = false;
    return --messageList[_id].likes.length;
  }

  function dropMessage(uint _id, int _dropAmount) whenNotPaused public payable returns(uint newdrops) {
    require(isUser(msg.sender));
    require(_id < messageList.length);
    require(_dropAmount > 0);
    require(userStructs[msg.sender].dropAmount >= uint(_dropAmount)*MULTIPLIER);

    messageList[_id].drops.push(msg.sender);
    messageList[_id].dropPointers[msg.sender].value += (uint(_dropAmount)*MULTIPLIER);
    messageList[_id].dropPointers[msg.sender].isSet = true;
    messageList[_id].dropAmount += (uint(_dropAmount)*MULTIPLIER);
    // payout share to author of the dropped message (50%)
    userStructs[messageList[_id].writtenBy].dropAmount += (uint(_dropAmount)*50*MULTIPLIER/100);
    // reduce the sender's dropAmount
    userStructs[msg.sender].dropAmount -= (uint(_dropAmount)*MULTIPLIER);
    // TODO: payout of drops to InkDrop and incentive pool
    // TODO: extend the timetolive
    return messageList[_id].dropAmount;
  }

    // Write a comment
  function createComment(uint256 _parent, string _content) whenNotPaused public payable returns(uint index) {
    require(isUser(msg.sender));
    require(bytes(_content).length > 0);
    require(isMessage(_parent));

    uint256 commentId = commentList.length;
    Message memory comment;
    // = Message(_content, msg.sender, now, 0, 0, msgId, -1, comments);
    comment.content = _content;
    comment.writtenBy = msg.sender;
    comment.timestamp = now;
    comment.id = commentId;
    comment.parent = _parent;
    comment.dropAmount = 0;
    commentList.push(comment);
    messageList[_parent].comments.push(commentId);
    return commentId;
  }

  function getComment(uint _commentId) public constant returns(uint parent, string content, address writtenBy, uint timestamp, uint timetolive, uint likes, uint drops) {
    require(_commentId < commentList.length);
    return (commentList[_commentId].parent, commentList[_commentId].content, commentList[_commentId].writtenBy, commentList[_commentId].timestamp, 
      commentList[_commentId].timetolive, commentList[_commentId].likes.length, commentList[_commentId].dropAmount);
  }

  function getStats() onlyOwner public constant returns(uint users, uint messages, uint comments) {
    return (userList.length, messageList.length, commentList.length);
  }

}
