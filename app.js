// 1. CREATE MODULES FOR PROJECT
// first modul BUDGET controller
var budgetController = (function(){

	var Expense = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type){
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	//object to store all expensive, income information
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
        addItem: function(type, des, val) {
            var newItem, ID;
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

		calculateBudget: function(){

			//calculate total incomes and total expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			//calculate precentage of ncome that we spent
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else{
				data.percentage = -1;
			}
		},

		getBudget: function(){
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function(){
			console.log(data);
		}
	};


})();

// second modul UI controller
var UIController = (function(){
	var DOMstrings = {
			inputType: '.add__type',
			inputDescription: '.add__description',
			inputValue: '.add__value',
			inputBtn: '.add__btn',
			incomeContainer: '.income__list',
			expensesContainer: '.expenses__list',
			budgetLabel: ".budget__value",
			incomeLabel: ".budget__income--value",
			expensesLabel: ".budget__expenses--value",
			percentageLabel: ".budget__expenses--percentage",
			container: ".container"
		};


	return {
		//creationg and object and method to get values from input fields
		getInput: function(){
			return{
				type:document.querySelector(DOMstrings.inputType).value, //income or exp
				description:document.querySelector(DOMstrings.inputDescription).value,//
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		// create html string with placeholder text
		addListItem: function(obj, type){
			var html, element;
			if(type === 'inc'){
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if(type ==='exp') {
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

		//replacethe placeholder text with data from netem object
		newHtml = html.replace('%id%',obj.id);
		newHtml = newHtml.replace('%description%',obj.description);
		newHtml = newHtml.replace('%value%',obj.value);

		//insert HTML into the DOM
		document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

		},

		//method to clear input fields after entering the input
		clearFields: function(){
			var fields, fieldsArr;
			//return a node list, we cannot use same methods as on an regular array so we have to convert into the array first
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			//using Array(array construction function which has prototype ) to what has a method slice and use call method on fields list)
			//cannot use slice method on list, slice returns a new array
			fieldsArr = Array.prototype.slice.call(fields);

			// use forEach method instead the for loop to loop throught array
			//forEach accepts callback function and that fnc can take up to 3 parameters
			//current = current intut value, index = id of item, array = fieldsArr
			fieldsArr.forEach(function(current, index, array){
				//set the input field to an empty string => empty field
				current.value = "";
			});

			//set the focus back to the frst field after entering the value
			//[0] set the focus in the first item in the array
			fieldsArr[0].focus();
		},

		displayBudget: function(obj){
			document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
			document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
			
			if(obj.percentage > 0 ){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = "---";
			}
			
		},

		getDOMstrings: function(){
			return DOMstrings;
		}
	};
})();


// third modul GLOBAL APP controller
//pass other two moduls as arguments and can uses their code, connect budget and UI moduls
var controller = (function(budgetController, UIController){

	//function for calling eventListeners and creating object for calling them outside
	var setUpEventListeners = function(){
			var DOM = UIController.getDOMstrings();
				document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

				document.addEventListener('keypress', function(e){
					if(e.keyCode === 13 || e.whitch === 13){
					ctrlAddItem();
					}
				});
			
		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);		
			
		};

	var updateBudget = function(){
		
		//1. Calculate budget
		budgetController.calculateBudget();
		
		//2. Return the budget
		var budget = budgetController.getBudget();
		
		//3. Display the budget on UI
		// also call in our init fnc to set everything to 0
		UIController.displayBudget(budget);
	};

	var ctrlAddItem = function(){
		
		var input, newItem;
		//1. Get input field data
		input = UIController.getInput();

		if(input.description !== "" && !isNaN(input.value) && input.value > 0){

			//2. Add the item to the budget controller
			newItem = budgetController.addItem(input.type, input.description, input.value);

			//3. Add the item to  the UI
			UIController.addListItem(newItem, input.type);

			//4. clear the fields
			UIController.clearFields();

			//5. Calculate and update budget
			updateBudget();
		}
	};
	
	var ctrlDeleteItem = function(e){
		var itemID;
		
		itemId = e.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			
			
		}
		
	};

	return {
		init: function(){
			setUpEventListeners();
			UIController.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			console.log('Aplication has started')
		}
	};
})(budgetController, UIController);

controller.init();
