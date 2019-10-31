function queryInteractions() {
	var rxcuis = "";
	var titles = document.getElementsByClassName("interaction_title");
	for (var title = 0; title < titles.length; title++) {
		titles[title].style.display = "none";
	}
	var lists = document.getElementsByClassName("interaction_list");
	for (var list = 0; list < lists.length; list++) {
		lists[list].innerHTML = "";
	}
	for (var drug in drugArray) {
		rxcuis += drugArray[drug] + "+";
	}
	rxcuis = rxcuis.slice(0, -1);
	$.ajax({ 
		type: "GET",
		dataType: "json",
		url: "https://rxnav.nlm.nih.gov/REST/interaction/list.json?sources=DrugBank&rxcuis=" + rxcuis,
		success: function(data){        
			analyseInteractions(data);
		}
	});
}

function analyseInteractions(data) {
	var licenceText = data.nlmDisclaimer;
	var interactionList = [];
	var effect = "";
	var tuple = [];

	if (data.fullInteractionTypeGroup) {
		for (var source in data.fullInteractionTypeGroup) {
			licenceText += "<br/>Drug interaction information is provided by DrugBank. " + data.fullInteractionTypeGroup[source].sourceDisclaimer.replace(".[www.drugbank.ca]", "");
			for (var interaction in data.fullInteractionTypeGroup[source].fullInteractionType) {
				var type = "other";
				var interactionData = data.fullInteractionTypeGroup[source].fullInteractionType[interaction];
				var interactionPair = interactionData.interactionPair[0].description;
				var drug1 = interactionData.minConcept[0].name;
				var drug2 = interactionData.minConcept[1].name;
				var interactionType = [
					["serum concentration", "serum_concentration"],
					["metabolism", "metabolism"],
					["adverse effects", "adverse_effects"],
					["therapeutic efficacy", "therapeutic_efficacy"],
					["antihypertensive", "antihypertensive"],
					["hypotensive", "antihypertensive"],
					["hypoglycemic", "hypoglycemic"],
					["QTc", "qt"]
				]
				for (var a in interactionType) {
					if (interactionPair.match(interactionType[a][0])) {
						type = interactionType[a][1];
					}
				}
				if (interactionPair.match("increased")) {
					effect = "increased";
				} else if (interactionPair.match("decreased")) {
					effect = "decreased";
				}
				
				tuple = [type, interactionPair, effect, drug1, drug2];
				interactionList.push(tuple);
			}
		}
	} else {
		document.getElementById("other").innerHTML = "No interactions found";
	}
	
	processInteractionList(interactionList);
	
	document.getElementById("licence").innerHTML = "Information is provided by the National Library of Medicines (NLM). " + licenceText;
}

function processInteractionList(interactionList) {
	var interactionCount = getInteractionCounts(interactionList);
	//var interactionEffects = getInteractionEffects(interactionList);
	// Add the number of interactions to the document
	var innerHTML = "";
	for (var i in interactionCount) {
		if (interactionCount[i] == 1) {
			innerHTML = "<li class='numberOfInteractions'>" + interactionCount[i] + " interaction</li>";
		} else {
			innerHTML = "<li class='numberOfInteractions'>" + interactionCount[i] + " interactions</li>";
		}
		document.getElementById(i).innerHTML += innerHTML;
		document.getElementById(i + "_title").style.display = "inline";
	}
	// Add the list of interactions to the document
	for (var k = 0; k < interactionList.length; k++) {
		var interactionHTML = "<li class='interaction'>" + interactionList[k][1] + "</li>";
		document.getElementById(interactionList[k][0]).innerHTML += interactionHTML;
		
	}
	
	//var innerHTML2 = "";
	//for (var j in interactionEffects) {
	//	if (interactionEffects[j] == 1) {
	//		innerHTML2 = "<li class='numberOfInteractions'>" + j + ": " + interactionEffects[j] + " interaction</li>";
	//	} else {
	//		innerHTML2 = "<li class='numberOfInteractions'>" + j + ": " + interactionEffects[j] + " interactions</li>";
	//	}
	//	document.getElementById("other").innerHTML += innerHTML2;
	//}
	//getInteractionDrugs(interactionList);
}

function getInteractionDrugs(interactionList) {
	var interactionDrugs = {};
	for (var i = 0; i < interactionList.length; i++) {
		for (var name in nameArray) {
			console.log(interactionList[i][1]);
			if (interactionList[i][1].toLowerCase().match(nameArray[name])) {
				if (interactionDrugs[nameArray[name]]) {
					interactionDrugs[nameArray[name]] += 1;
				} else {
					interactionDrugs[nameArray[name]] = 1;					
				}
			} 
		}
	}
	console.log(interactionDrugs);
}

function getInteractionEffects(interactionList) {
	var interactionEffects = {};
	for (var i = 0; i < interactionList.length; i++) {
		
		if (interactionEffects[interactionList[i][0] + " " + interactionList[i][2]]) {
			interactionEffects[interactionList[i][0] + " " + interactionList[i][2]] += 1;
		} else {
			interactionEffects[interactionList[i][0] + " " + interactionList[i][2]] = 1;
		}
	}
	return interactionEffects;
}

function getInteractionCounts(interactionList) {
	var interactionCount = {};
	for (var i = 0; i < interactionList.length; i++) {
		if (interactionCount[interactionList[i][0]]) {
			interactionCount[interactionList[i][0]] += 1;
		} else {
			interactionCount[interactionList[i][0]] = 1;
		}
	}
	return interactionCount;
}

function processList(list, array) {
	if (array.length > 0) {
		var innerHTML = "";
		document.getElementById(list + "_title").style.display = "inline";
		if (array.length == 1) {
			innerHTML = "<li class='numberOfInteractions'>" +array.length + " interaction</li>";
		} else {
			innerHTML = "<li class='numberOfInteractions'>" +array.length + " interactions</li>";
		}
		for (var i = 0; i < array.length; i++) {
			innerHTML += array[i];
		}
		document.getElementById(list).innerHTML = innerHTML;
	}
}

function addAnotherDrug() {
	// Generate a new id for the new input field
	var newInputId = "drug" + (document.getElementsByClassName("drug").length + 1);
	// Get the container where the elements are placed
	var container = document.getElementById("container");
	// Create an autocomplete div (for the autocomplete suggestions) and add it to the container
	var div = document.createElement("div");
	div.className = "autocomplete";
	container.appendChild(div);
	//create an input field and add it to the autocomplete div
	var input = document.createElement("input");
	input.type = "text";
	input.className= "drug";
	input.placeholder = "Drug name";
	input.id= newInputId;
	div.appendChild(input);
	// Add a delete button
	if (newInputId != "drug1" && newInputId != "drug2") {
		var button = "<button class='drugbutton' id='" + newInputId + "button" + "' onClick='removeDrug(this.id)'>X</button>";
		div.innerHTML += button;
		//Focus the cursor on the new input field
		document.getElementById(newInputId).focus();
	} else {
		document.getElementById("drug1").focus();
	}
	// Generate the autocomplete list for for the new input field
	input = document.getElementById(newInputId);
	autocomplete(input, displaynames);	
}

function checkInteractions() {
	var classes = document.getElementsByClassName("drug");
	for (var element in classes) {
		if (classes[element].value) {
			nameArray.push(classes[element].value);
		}
	}
	for (var drug in nameArray) {
		query(nameArray[drug]);
	}
}

function query(drug) {
	$.ajax({ 
		type: "GET",
		dataType: "json",
		url: "https://rxnav.nlm.nih.gov/REST/rxcui?name=" + drug,
		success: function(data){
			drugArray.push(data.idGroup.rxnormId[0]);
			if (drugArray.length == nameArray.length) {
				queryInteractions();
			}
		}
	});
}

var displaynames = [];
var nameArray = [];

window.onload = function() {
	//Add at least 2 drug input fields on initial loading
	if ($("#drug1").length === 0) {
		addAnotherDrug();
	}
	if ($("#drug2").length === 0) {
		addAnotherDrug();
	}
	if (typeof(Storage) !== "undefined") {
		if (localStorage.displaynames) {
			displaynames = JSON.parse(localStorage.displaynames);
			setAutocompletes();
		} else {
			getDisplayNames();
		}
	} else {
		getDisplayNames();
	}
};

function getDisplayNames() {
	$.ajax({ 
		type: "GET",
		dataType: "json",
		url: "https://rxnav.nlm.nih.gov/REST/displaynames",
		success: function(data){
			displaynames = data.displayTermsList.term;
			setAutocompletes();
			if (typeof(Storage) !== "undefined") {
				localStorage.displaynames = JSON.stringify(displaynames);
			} 
		}
	});
}

function setAutocompletes() {
	var inputs = document.getElementsByClassName("drug");
	for (var i = 0; i < inputs.length; i++) {
		autocomplete(inputs[i], displaynames);
	}
}

function removeDrug(id) {
	document.getElementById(id).remove();
	var inputId = id.replace("button","");
	document.getElementById(inputId).remove();
}

function autocomplete(inp, arr) {
	/*the autocomplete function takes two arguments,
	the text field element and an array of possible autocompleted values:*/
	var currentFocus;
	/*execute a function when someone writes in the text field:*/
	inp.addEventListener("input", function(e) {
		var a, b, i, val = this.value;
		/*close any already open lists of autocompleted values*/
		closeAllLists();
		if (!val) { return false;}
		currentFocus = -1;
		/*create a DIV element that will contain the items (values):*/
		a = document.createElement("DIV");
		a.setAttribute("id", this.id + "autocomplete-list");
		a.setAttribute("class", "autocomplete-items");
		/*append the DIV element as a child of the autocomplete container:*/
		this.parentNode.appendChild(a);
		if (val.length>2){
			/*for each item in the array...*/
			for (i = 0; i < arr.length; i++) {
				/*check if the item starts with the same letters as the text field value:*/
				if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
					/*create a DIV element for each matching element:*/
					b = document.createElement("DIV");
					/*make the matching letters bold:*/
					b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
					b.innerHTML += arr[i].substr(val.length);
					b.innerHTML = b.innerHTML.toLowerCase();
					/*insert a input field that will hold the current array item's value:*/
					b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
					/*execute a function when someone clicks on the item value (DIV element):*/
					b.addEventListener("click", function(f) {
						/*insert the value for the autocomplete text field:*/
						inp.value = this.getElementsByTagName("input")[0].value.toLowerCase();
						/*close the list of autocompleted values,
						(or any other open lists of autocompleted values:*/
						closeAllLists();
					});
					a.appendChild(b);
				}
			}
		}
	});
	/*execute a function presses a key on the keyboard:*/
	inp.addEventListener("keydown", function(e) {
		var x = document.getElementById(this.id + "autocomplete-list");
		if (x) x = x.getElementsByTagName("div");
		if (e.keyCode == 40) {
			/*If the arrow DOWN key is pressed,
			increase the currentFocus variable:*/
			currentFocus++;
			/*and and make the current item more visible:*/
			addActive(x);
		} else if (e.keyCode == 38) { //up
			/*If the arrow UP key is pressed,
			decrease the currentFocus variable:*/
			currentFocus--;
			/*and and make the current item more visible:*/
			addActive(x);
		} else if (e.keyCode == 13) {
			/*If the ENTER key is pressed, prevent the form from being submitted,*/
			e.preventDefault();
			if (currentFocus > -1) {
				/*and simulate a click on the "active" item:*/
				if (x) x[currentFocus].click();
			}
		}
	});
	function addActive(x) {
		/*a function to classify an item as "active":*/
		if (!x) return false;
		/*start by removing the "active" class on all items:*/
		removeActive(x);
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = (x.length - 1);
		/*add class "autocomplete-active":*/
		x[currentFocus].classList.add("autocomplete-active");
	}
	function removeActive(x) {
		/*a function to remove the "active" class from all autocomplete items:*/
		for (var i = 0; i < x.length; i++) {
			x[i].classList.remove("autocomplete-active");
		}
	}
	function closeAllLists(elmnt) {
		/*close all autocomplete lists in the document,
		except the one passed as an argument:*/
		var x = document.getElementsByClassName("autocomplete-items");
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != inp) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}
	/*execute a function when someone clicks in the document:*/
	document.addEventListener("click", function (e) {
		closeAllLists(e.target);
	});
} 
