pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;
import "./ETLToken.sol";

contract contractB {
    ETLToken tokenContract = ETLToken(0x06c3caFae04F15851be7E3B72deA2dA3E0f696E0); 
    mapping ( address => uint256 ) public balances;

    function deposit(address _user, uint tokens) public {

        // add the deposited tokens into existing balance 
        balances[_user]+= tokens;

        // transfer the tokens from the sender to this contract
        tokenContract.transferFrom(_user, address(this), tokens);
    }

    function share(address _user, uint tokens) public {
        tokenContract.transferFrom(address(this), _user, tokens);
    }

    function returnTokens(address _user) public {
        balances[_user] = 0;
        tokenContract.transferFrom(address(this), _user, balances[_user]);
    }

}

contract QuestionFactory {
    address[] private deployedQuestions;
    mapping(address => address) public users;
    mapping(address => address) public owner;
    mapping(address => string) public nftClaim;
    address public contractbinstance;

    ETLToken tokenContract = ETLToken(0x06c3caFae04F15851be7E3B72deA2dA3E0f696E0);

    function createQuestion(string memory category, string memory questionTitle, string memory description, uint deposit, 
                    uint maxDuration, string[] memory fileHashesQuestion, string[] memory fileNamesQuestion) public {
        if (users[msg.sender] == address(0x0)) {
            Profile profile = new Profile(msg.sender);
            users[msg.sender] = address(profile);
        }

        require(deposit>0, "Deposit cannot be 0");
        require((deposit/10**4)<=Profile(users[msg.sender]).getToken(msg.sender), "Insufficient tokens");
        Question newQuestion = new Question(category, questionTitle, description, deposit, maxDuration,
                                    fileHashesQuestion, fileNamesQuestion, msg.sender, users[msg.sender]);
        deployedQuestions.push(address(newQuestion));
        
        Question question = Question(newQuestion);
        //transfer deposit from user to contractB instance
        contractbinstance = question.getContractBInstance();
        tokenContract.approve(msg.sender, contractbinstance, deposit); 
        contractB(contractbinstance).deposit(msg.sender, deposit);

        Profile(users[msg.sender]).increaseNumOfQues();
        question.postQuestion();  //Save posted time here
        

    }

    function createAnswer(address _question, string memory _reply, string[] memory _fileHashes, string[] memory _fileNames, int _parent) public {
        if (users[msg.sender] == address(0x0)) {
            Profile profile = new Profile(msg.sender);
            users[msg.sender] = address(profile);
        }   
        Question question = Question(_question);
        question.answer(_reply, _fileHashes, _fileNames, msg.sender, users[msg.sender], _parent);
        Profile(users[msg.sender]).increaseNumOfAns();
    }

    function ratingQuestionAt(address _question, uint _ratingQuestion) public payable{
        if (users[msg.sender] == address(0x0)) {
            Profile profile = new Profile(msg.sender);
            users[msg.sender] = address(profile);
        }

        Question question = Question(_question);
        contractbinstance = question.getContractBInstance();
        //Require user to have at least one token to rate question
        require(1<Profile(users[msg.sender]).getToken(msg.sender), "Insufficient tokens");
        
        //transfer 1 token as deposit from user to contractB instance to rate question
        tokenContract.approve(msg.sender, contractbinstance, 1*10**2); 
        contractB(contractbinstance).deposit(msg.sender, 1*10**2);
        
        question.ratingQuestion(_ratingQuestion); 
        question.updateDeposite(1*10**2);
        Profile(users[msg.sender]).updateToken(0, 1*10**2);
        Profile(question.getOwnerP()).increaseSumOfQuesRate(_ratingQuestion);
        
        //store who deposited tokens
        question.setQuestionDepositers(msg.sender);
    
    }

    function ratingAnswerAt(address _question, uint _ratingAnswer, uint _index) public payable {
        if (users[msg.sender] == address(0x0)) {
            Profile profile = new Profile(msg.sender);
            users[msg.sender] = address(profile);
        }

        Question question = Question(_question);
        //rating answer doesnt require deposit
        question.updateAnswerRate(_ratingAnswer, _index);
        Profile(question.getAnswererP(_index)).increaseSumOfAnsRate(_ratingAnswer);
    }

    function claimNFTAt(address _question) public payable {
        if (users[msg.sender] == address(0x0)) {
            Profile profile = new Profile(msg.sender);
            users[msg.sender] = address(profile);
        }

        Question question = Question(_question);
        question.claimNFT();
    }

    function shareTokenAt(address _question) public payable {
        if (users[msg.sender] == address(0x0)) {
            Profile profile = new Profile(msg.sender);
            users[msg.sender] = address(profile);
        }

        Question question = Question(_question);
        question.shareToken();
    }

    function returnDepositAt(address _question) public payable {
        if (users[msg.sender] == address(0x0)) {
            Profile profile = new Profile(msg.sender);
            users[msg.sender] = address(profile);
        }

        Question question = Question(_question);
        question.returnDeposit();
    }

    function hasProfile(address _user) public returns(bool) {
        if (users[_user] == address(0x0)) {
            return false;
        } else {
            return true;
        }
    }

    function getProfile(address _user) public returns(address) {
        require(users[_user] != address(0x0));
        return users[_user];
    }
    
    function getDeployedQuestions() public view returns(address[] memory) {
        return deployedQuestions;
    }
    
    function setNftClaim(address _address, string memory dataUri) public {
        nftClaim[_address] = dataUri;
    }
}    


contract Question {

    struct Answer {
        string replyHash;
        string[] fileHashes;
        string[] fileNames;
        address answerer;
        Profile answererP;
        uint answerTime;
        uint answerRate; 
        uint answerNumRate;
        uint answerSumRate;
        int parent;
        int id;       //Keep track parent answers
    }

    Answer[] public answerList; 
    string[] public fileHashesQuestion;
    string[] public fileNamesQuestion;
    string public questionTitle;
    string public description;
    uint public deposit;
    uint public maxDuration;
    address public owner;
    Profile public ownerP;
    uint public start;
    uint public questionRate;
    uint public numRate;
    uint public sumRate;
    bool public alreadyShareToken = false;
    bool public alreadyReturnDeposit =  false;
    bool public alreadyClaimNFT = false;
    bool public numAnswer4Bool;
    uint public tokenSum;
    uint public proportion;
    uint public numPeople;
    string public category;
    int public count = 0;
    address public contractbinstance;
    //map each question to its own contractB instance
    mapping(address => address) public questionContractB;
    mapping(address => address[]) public questionDepositers;
    uint public initialDeposit;
    ETLToken tokenContract = ETLToken(0x06c3caFae04F15851be7E3B72deA2dA3E0f696E0);


    constructor (string memory _category, string memory _questionTitle, string memory _description, uint _deposit, uint _maxDuration, string[] memory _fileHashesQuestion, string[] memory _fileNamesQuestion, address _owner, address _ownerP) public {
        category = _category;
        questionTitle = _questionTitle;
        description = _description;
        deposit = _deposit;
        maxDuration = _maxDuration;
        fileHashesQuestion = _fileHashesQuestion;
        fileNamesQuestion = _fileNamesQuestion;
        owner = _owner;
        ownerP = Profile(_ownerP);
        
        //create contractB instance each time a new Question is created
        if (questionContractB[address(this)] == address(0x0)) {
            contractB contractb = new contractB();
            contractbinstance = address(contractb);
            questionContractB[address(this)] = contractbinstance;
        }
         
    }
    
    function getContractBInstance() public returns (address) {
        return questionContractB[address(this)];
    }

    function getSummary() public view returns (
        string memory, string memory, uint, uint, address, string[] memory, string[] memory
    ) {
        return(
            questionTitle,
            description,
            deposit,
            maxDuration,
            owner,
            fileHashesQuestion,
            fileNamesQuestion
        );
    }

    function getCategory() public view returns (string memory) {
        return category;
    }

    function getOwner() public view returns (address){
        return owner;
    }

    function getOwnerP() public view returns (Profile){
        return ownerP;
    }
    
    function getAnswererP(uint _index) public view returns (Profile){
        return answerList[_index].answererP;
    }

    function getTime() public view returns (uint, uint, uint) {
        return(
            start,
            block.timestamp,
            maxDuration
        );
    }

    function ratingQuestion(uint _ratingQuestion) public {
        numRate++;
        sumRate = sumRate + _ratingQuestion;
        questionRate = sumRate/numRate;
    }

    function getRatingQuestion() public returns (uint){
        return questionRate;
    }

    function updateDeposite(uint _value) public {
        deposit = deposit + _value;
    }

    function getDeposit() public returns (uint){
        return deposit;
    }
    
    function getQuestionDepositers(address _question) public view returns (address[] memory) {
        return questionDepositers[_question];
    }
    
    function setQuestionDepositers(address _questionDepositer) public {
        questionDepositers[address(this)].push(_questionDepositer);
    }

    function isOverdue() public returns (bool) {
        uint publishingTime = block.timestamp - start;

        return publishingTime > maxDuration;

    }

    function getCheckClaimNFT() public returns (bool) {
        return (!alreadyClaimNFT);
    }

    function getCheckShareToken() public returns(bool){
        return (!alreadyShareToken);
    }

    function getCheckReturnDeposit() public returns(bool) {
        return(!alreadyReturnDeposit);
    }

    function getNumAnswer4() public returns (bool){
        uint getNumAnswer4;
        for (uint i = 0;i < answerList.length;i++) {
            if(answerList[i].answerRate >= 4) 
                getNumAnswer4++;
            if(getNumAnswer4>0) {
                numAnswer4Bool = true;
                return true; 
            }
            else {
                numAnswer4Bool = false;
                return false;
            }
        }
    }

    function returnDeposit() public {
        uint publishingTime = block.timestamp - start;

        if (publishingTime > maxDuration) {
            for (uint i=0; i<questionDepositers[address(this)].length;i++) {
                tokenContract.approve(questionContractB[address(this)], questionDepositers[address(this)][i], 1*10**2); 
                contractB(questionContractB[address(this)]).share(questionDepositers[address(this)][i], 1*10**2);
            }
            //transfer initial deposit back to owner of question
            initialDeposit = deposit - (questionDepositers[address(this)].length * 10**2);
            tokenContract.approve(questionContractB[address(this)], owner, initialDeposit); 
            contractB(questionContractB[address(this)]).share(owner, initialDeposit);
        
        }

        alreadyReturnDeposit = true;
    }

    function claimNFT() public {
        alreadyClaimNFT = true;
    }

    function shareToken() public {
        for (uint i = 0;i < answerList.length;i++) {
            if(answerList[i].answerRate >= 4){ 
                numPeople++;
            }
        }
        
        proportion = (deposit) / numPeople; //if uint solidity rounds down eg 1/6 * 100 = 16 (not 16.23.)
        for (uint i = 0; i < answerList.length;i++) {
            if(answerList[i].answerRate >= 4){ //Only take 4 stars above into account
                tokenContract.approve(questionContractB[address(this)], answerList[i].answerer, proportion); 
                contractB(questionContractB[address(this)]).share(answerList[i].answerer, proportion);

            }
        }

        alreadyShareToken = true;
    }
    
    function postQuestion() public {
        start = block.timestamp;   
    }

    function answer(string memory _reply, string[] memory _fileHashes, string[] memory _fileNames, address _answerer, address _answererP, int _parent) public {
        int _id;
        if (_parent == -1) {   //a parent answer
            _id = count;   
            count++;
        } else {               //a child answer
            _id = -1;
        }

        Answer memory newAnswer = Answer({
            replyHash: _reply,
            fileHashes: _fileHashes,
            fileNames: _fileNames,
            answerer: _answerer,
            answererP: Profile(_answererP),
            answerTime: block.timestamp,
            answerRate: 0,
            answerNumRate: 0,
            answerSumRate: 0,
            parent: _parent,
            id: _id
        }); 
        
        answerList.push(newAnswer);
    } 


    function getAnswerList() public view returns (Answer[] memory) {
        return answerList;
    }

    function updateAnswerRate(uint _value, uint index) public {
        answerList[index].answerNumRate ++;
        answerList[index].answerSumRate += _value;
        answerList[index].answerRate = answerList[index].answerSumRate/answerList[index].answerNumRate;
    }

    function getAnswerRate(uint index) public view returns (uint) {
        return answerList[index].answerRate;
    }

}

contract Profile {
    ETLToken public tokenContract = ETLToken(0x06c3caFae04F15851be7E3B72deA2dA3E0f696E0);
    uint public token;
    uint public numOfQues;
    uint public sumOfQuesRate;
    uint public numOfAns;
    uint public sumOfAnsRate;
    uint public avgQuesRate;
    uint public avgAnsRate;
    address public user;
    
    constructor (address _user) public {
        user = _user;
    }

    function increaseNumOfQues() public {
        numOfQues++;
    }

    function increaseNumOfAns() public {
        numOfAns++;
    }

    function increaseSumOfQuesRate(uint _rate) public {
        sumOfQuesRate += _rate;
    }

    function increaseSumOfAnsRate(uint _rate) public {
        sumOfAnsRate += _rate;
    }

    function getavgQuesRate() public returns (uint){
        if (numOfQues == 0) {
            avgQuesRate = 0;
            return avgQuesRate;
        }
        else {
            avgQuesRate = sumOfQuesRate/numOfQues;
            return avgQuesRate;
        }
    }

    function getavgAnsRate() public returns (uint){
        if (numOfAns == 0) {
            avgAnsRate = 0;
            return avgAnsRate;
        }
        else {
            avgAnsRate = sumOfAnsRate/numOfAns;
            return avgAnsRate;
        }
    }

    function getNumOfQues() public returns (uint){
        return numOfQues;
    }

    function getNumOfAns() public returns (uint){
        return numOfAns;
    }

    function updateToken(uint addOrSub, uint _token) public {
        if (addOrSub==1){ //1 is add
            token += (_token);
        }
        else if(addOrSub==0){ // 0 is sub
            token -= (_token);
        }
    }

    function getToken(address _user) public returns(uint){
        token = tokenContract.balanceOf(_user); 
        
        return token;


    }


}




