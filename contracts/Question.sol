pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;
import "./ETLToken.sol";

contract contractB {
    ETLToken tokenContract = ETLToken(0x7E14A1AD36595cf73D0eE8d24d936e24A7eDbb85); //0xbe8eC8351CFd6640db115b58D322014cf54743D3
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
    address public contractbinstance;

    ETLToken tokenContract = ETLToken(0x7E14A1AD36595cf73D0eE8d24d936e24A7eDbb85);

    function createQuestion(string category, string questionTitle, string description, uint deposit, 
                    uint maxDuration, string[] fileHashesQuestion, string[] fileNamesQuestion) public {
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }

        require(deposit>0, "Deposit cannot be 0");
        require((deposit/10**2)<=Profile(users[msg.sender]).getToken(msg.sender), "Insufficient tokens");
        address newQuestion = new Question(category, questionTitle, description, deposit, maxDuration,
                                    fileHashesQuestion, fileNamesQuestion, msg.sender, users[msg.sender]);
        deployedQuestions.push(newQuestion);
        
        Question question = Question(newQuestion);
        //transfer deposit from user to contractB instance
        contractbinstance = question.getContractBInstance();
        tokenContract.approve(msg.sender, contractbinstance, deposit*10**2); 
        contractB(contractbinstance).deposit(msg.sender, deposit*10**2);

        Profile(users[msg.sender]).increaseNumOfQues();
        question.postQuestion();  //Save posted time here
        

    }

    function createAnswer(address _question, string _reply, string[] _fileHashes, string[] _fileNames, int _parent) public {
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }   
        Question question = Question(_question);
        question.answer(_reply, _fileHashes, _fileNames, msg.sender, users[msg.sender], _parent);
        Profile(users[msg.sender]).increaseNumOfAns();
    }

    function ratingQuestionAt(address _question, uint _ratingQuestion) public payable{
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }

        Question question = Question(_question);
        contractbinstance = question.getContractBInstance();
        //Require user to have at least one token to rate question
        require(1<Profile(users[msg.sender]).getToken(msg.sender), "Insufficient tokens");
        
        //transfer 1 token as deposit from user to contractB instance to rate question
        tokenContract.approve(msg.sender, contractbinstance, 1*10**2); 
        contractB(contractbinstance).deposit(msg.sender, 1*10**2);
        
        question.ratingQuestion(_ratingQuestion); 
        question.updateDeposite(1);
        Profile(users[msg.sender]).updateToken(0, 1);
        Profile(question.getOwnerP()).increaseSumOfQuesRate(_ratingQuestion);
        
        //store who deposited tokens
        question.setQuestionDepositers(msg.sender);
    
    }

    function ratingAnswerAt(address _question, uint _ratingAnswer, uint _index) public payable {
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }

        Question question = Question(_question);
        //rating answer doesnt require deposit
        question.updateAnswerRate(_ratingAnswer, _index);
        Profile(question.getAnswererP(_index)).increaseSumOfAnsRate(_ratingAnswer);
    }


    function shareTokenAt(address _question) public payable {
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }

        Question question = Question(_question);
        question.shareToken();
    }

    function returnDepositAt(address _question) public payable {
        if (users[msg.sender] == 0) {
            address profile = new Profile(msg.sender);
            users[msg.sender] = profile;
        }

        Question question = Question(_question);
        question.returnDeposit();
    }

    function hasProfile(address _user) public returns(bool) {
        if (users[_user] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function getProfile(address _user) public returns(address) {
        require(users[_user] != 0);
        return users[_user];
    }
    
    function getDeployedQuestions() public view returns(address[]) {
        return deployedQuestions;
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
    uint256 public initialDeposit;
    ETLToken tokenContract = ETLToken(0x7E14A1AD36595cf73D0eE8d24d936e24A7eDbb85);


    //fallback function
    function() payable { }
    
    function Question (string _category, string _questionTitle, string _description, uint _deposit, uint _maxDuration, string[] _fileHashesQuestion, string[] _fileNamesQuestion, address _owner, address _ownerP) public {
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
        if (questionContractB[this] == 0) {
            contractB contractb = new contractB();
            contractbinstance = contractb;
            questionContractB[this] = contractbinstance;
        }
         
    }
    
    function getContractBInstance() public returns (address) {
        return questionContractB[this];
    }

    function getSummary() public view returns (
        string, string, uint, uint, address, string[], string[]
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

    function getCategory() public view returns (string) {
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
            now,
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
    
    function getQuestionDepositers(address _question) public view returns (address[]) {
        return questionDepositers[_question];
    }
    
    function setQuestionDepositers(address _questionDepositer) public {
        questionDepositers[this].push(_questionDepositer);
    }

    function isOverdue() public returns (bool) {
        uint publishingTime = now - start;

        return publishingTime > maxDuration;

    }

    function getCheckShareToken() returns(bool){
        return (!alreadyShareToken);
    }

    function getCheckReturnDeposit() returns(bool) {
        return(!alreadyReturnDeposit);
    }

    function getNumAnswer4() public view returns (bool){
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
        uint publishingTime = now - start;

        if (publishingTime > maxDuration) {
            for (uint i=0; i<questionDepositers[this].length;i++) {
                tokenContract.approve(questionContractB[this], questionDepositers[this][i], 1*10**2); 
                contractB(questionContractB[this]).share(questionDepositers[this][i], 1*10**2);
            }
            //transfer initial deposit back to owner of question
            initialDeposit = deposit - questionDepositers[this].length;
            tokenContract.approve(questionContractB[this], owner, initialDeposit*10**2); 
            contractB(questionContractB[this]).share(owner, initialDeposit*10**2);
        
        }

        alreadyReturnDeposit = true;
    }

    function shareToken() public {
        for (uint i = 0;i < answerList.length;i++) {
            if(answerList[i].answerRate >= 4){ 
                numPeople++;
            }
        }
        
        proportion = (deposit * 10**2) / numPeople; //1/6 * 100 = 16 (not 16...)
        for (i = 0; i < answerList.length;i++) {
            if(answerList[i].answerRate >= 4){ //Only take 4 stars above into account
                tokenContract.approve(questionContractB[this], answerList[i].answerer, proportion); 
                contractB(questionContractB[this]).share(answerList[i].answerer, proportion);

            }
        }

        alreadyShareToken = true;
    }
    
    function postQuestion() public {
        start = now;   
    }

    function answer(string _reply, string[] _fileHashes, string[] _fileNames, address _answerer, address _answererP, int _parent) public {
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
            answerTime: now,
            answerRate: 0,
            answerNumRate: 0,
            answerSumRate: 0,
            parent: _parent,
            id: _id
        }); 
        
        answerList.push(newAnswer);
    } 


    function getAnswerList() public view returns (Answer[]) {
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
    ETLToken public tokenContract = ETLToken(0x7E14A1AD36595cf73D0eE8d24d936e24A7eDbb85);
    uint public token;
    uint public numOfQues;
    uint public sumOfQuesRate;
    uint public numOfAns;
    uint public sumOfAnsRate;
    uint public avgQuesRate;
    uint public avgAnsRate;
    address public user;
    
    function Profile (address _user) public {
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
        token = tokenContract.balanceOf(_user) / 10**2;
        
        return token;


    }


}




