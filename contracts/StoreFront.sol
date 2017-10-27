pragma solidity ^0.4.11;

contract StoreFront {
    struct Product {
        address owner;
        string id;
        uint price;
        uint quantity;
        bool initialized;
    }
    struct User {
        string name;
        uint balance;
        bool administrationAccess;
        bool initialized;
        mapping(string=>Product) shoppingBasket;
    }
    address owner;
    string[] productIds;
    mapping(address=>User) users;
    mapping(string=>Product) products;

    event LogPromoteToAdmin(address administratorAddress);
    event LogAddUser(address userAddress, string name, uint balance);
    event LogAddProduct(address productOwner, string id, uint price, uint quantity);
    event LogAddStock(string id, uint quantity);
    event LogUserInfo(string name, uint balance, bool administrationAccess, bool initialized);

    modifier isAdministrator() {
        require(users[msg.sender].administrationAccess == true);
        _;
    }
    
    modifier isUser() {
        require(users[msg.sender].initialized);
        _;
    }
    
    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }
    
    function StoreFront() public {
        owner = msg.sender;
    }

    function promoteToAdmin(address administratorAddress) isOwner() public {
        if(users[administratorAddress].initialized){
            LogPromoteToAdmin(administratorAddress);
            users[administratorAddress].administrationAccess = true; 
        }
    }
    
    function addUser(string name) public payable {
        require(!users[msg.sender].initialized);
        LogAddUser(msg.sender, name, msg.value);
        users[msg.sender] = User(name, 0, false, true);
    }
    
    function addProduct(string id, uint price, uint quantity) isAdministrator() public {
        productIds.push(id);
        products[id] = Product(msg.sender, id, price, quantity, true);
    }
    
    function addStock(uint quantity, string id) isAdministrator() public {
        require(products[id].initialized);
        products[id].quantity += quantity;
    }
    
    function purchase(string id, uint quantity) isUser() public payable {
        require(products[id].initialized);
        //make the payment
        if ((quantity * products[id].price) > users[msg.sender].balance) {
            revert();
        } else {
            users[msg.sender].balance - (quantity * products[id].price);
        }
        
        //add the product to the user shopping basket
        if(users[msg.sender].shoppingBasket[id].initialized) {
            users[msg.sender].shoppingBasket[id].quantity += quantity;
        } else {
            users[msg.sender].shoppingBasket[id] = Product(msg.sender, id, products[id].price, quantity, true);
        }
    }
    
    function withdraw() public {
        require(users[msg.sender].initialized);
        uint sendAmount = users[msg.sender].balance;
        users[msg.sender].balance = 0;
        msg.sender.transfer(sendAmount);
    }
    
    
    function deposit() public payable isUser() {
        users[msg.sender].balance += msg.value;
    }
    
    function() public {
        revert();
    }
    
}