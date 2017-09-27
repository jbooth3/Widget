// These variables are for saving the original background colors
var previousElements=new Array();
var previousColors=new Array();
var previousColorAvailable=new Array();
var previousClassNames=new Array();
var elementCount=0;

/////////////////////////////////////////////////////
// This function takes an element as a parameter and 
//   returns an object which contain the saved state
//   of the element's background color.
/////////////////////////////////////////////////////
function saveBackgroundStyle(myElement)
{
  var saved=new Object();
  saved.element=myElement;
  saved.className=myElement.className;
  if (myElement.style && myElement.style["backgroundColor"])
  {
    saved.hasBackgroundColor=1; 
    saved.backgroundColor=myElement.style["backgroundColor"];
  }
  else
    saved.hasBackgroundColor=0;      
}

/////////////////////////////////////////////////////
// This function takes an element as a parameter and 
//   returns an object which contain the saved state
//   of the element's background color.
/////////////////////////////////////////////////////
function restoreBackgroundStyle(savedState, targetElement)
{
  if (targetElement.style && savedState.hasBackgroundColor)
  {
    targetElement.style["backgroundColor"]=savedState.backgroundColor;
  }
  if (savedState.className)
  {
    targetElement.className=savedState.className;    
  }
}

/////////////////////////////////////////////////////
// This function is used by highlightTableRow()
/////////////////////////////////////////////////////
function findNode(startingNode, tagName)
{
  // on Firefox, the TD node might not be the firstChild node of the TR node
  myElement=startingNode;
  var i=0;
  while (myElement && (!myElement.tagName || (myElement.tagName && myElement.tagName!=tagName)))
  {
    myElement=startingNode.childNodes[i];
    i++;
  }  
  if (myElement && myElement.tagName && myElement.tagName==tagName)
  {
    return myElement;
  }
  // on IE, the TD node might be the firstChild node of the TR node  
  else if (startingNode.firstChild)
    return findNode(startingNode.firstChild, tagName);
  return 0;
}

/////////////////////////////////////////////////////
// Highlight table row.
// newElement could be any element nested inside the table
// highlightColor is the color of the highlight
/////////////////////////////////////////////////////
function highlightTableRow(highlightColor)
{
	highlightColor='#ffa500';
  var i=0;
  // Restore color of the previously highlighted row
  for (i; i<elementCount; i++)
  {
    var myElement=previousElements[i];
    if (myElement.style && previousColorAvailable[i])
    {
      myElement.style["backgroundColor"]=previousColors[i];
    }
    previousColors[i]=0;
    previousColorAvailable[i]=0;
    if (previousClassNames[i])
    {
      myElement.className=previousClassNames[i];    
    }
    previousElements[i]=0;
    previousClassNames[i]=0;
  }
  elementCount=0;
  
  // To get the node to the row (ie: the <TR> element), 
  // we need to traverse the parent nodes until we get a row element (TR)
  var myElement=this;

  // If you don't want a particular row to be highlighted, set it's id to "header"
  if (myElement && myElement.id && myElement.id=="header")  
    return;
		  
  // Highlight every cell on the row
  if (myElement)
  {
    var previousRow=myElement;
    
    // Save the backgroundColor style OR the style class of the row (if defined)
    if (previousRow)
    {
      previousElements[elementCount]=previousRow;
      previousClassNames[elementCount]=previousRow.className;
      previousColors[elementCount]=previousRow.style["backgroundColor"];
      previousColorAvailable[elementCount]=1;
      elementCount++;  
    }

    // myElement is a <TR>, then find the first TD
    var tableCell=findNode(myElement, "TD");    

    var i=0;
    // Loop through every sibling (a sibling of a cell should be a cell)
    // We then highlight every siblings
    while (tableCell)
    {
      // Make sure it's actually a cell (a TD)
      if (tableCell.tagName=="TD")
      {
        previousElements[elementCount]=tableCell;      
        // If no style has been assigned, assign it, otherwise Netscape will 
        // behave weird.
        if (!tableCell.style)
        {
          tableCell.style={};
        }
        else
        {
          previousClassNames[elementCount]=tableCell.className;
          previousColors[elementCount]=tableCell.style["backgroundColor"];
          previousColorAvailable[elementCount]=1;
          elementCount++;
        }
        // Assign the highlight color.  Remember this is stored as paramater in propagateEventHandler function
        tableCell.style["backgroundColor"]=this.parameter["onmouseover"];

        // Optional: alter cursor
        tableCell.style.cursor='default';
        i++;
      }
      // Go to the next cell in the row
      tableCell=tableCell.nextSibling;
    }
  }
}

/////////////////////////////////////////////////////
// This function traverses the DOM tree of the currentElement
// When currentElement's tagName matches elementTagNameToAttachHandlerTo
// then that element's eventName is assigned to eventHandlerFunctionToBeCalled.
//
// For example, to traverse a <table> and assigns doSomething onmouseover event handler to every <tr> element,
// the function call is something like this:
// propagateEventHandler(document.getElementById("tableId", "onmouseover", "TR" "doSomething", parameter);
/////////////////////////////////////////////////////
function propagateEventHandler(currentElement, eventName, elementTagNameToAttachHandlerTo, eventHandlerFunctionToBeCalled, eventHandlerFunctionParam)
{
  if (currentElement)
  {
//	alert(elementTagNameToAttachHandlerTo);  
    var j;
    var tagName=currentElement.tagName;

	// save the original handler (this is for illustration purpose, it is not necessary)
	if (currentElement.tagName==elementTagNameToAttachHandlerTo)
	{
		if (currentElement[eventName])
		{
		  if (!currentElement.originalEventHandler)
			 currentElement.originalEventHandler=new Object();
		  currentElement.originalEventHandler[eventName]=currentElement[eventName];
		}
	
		// This is needed because IE 7 chokes when arying to assign event to certain elements
		try
		{
			//alert(currentElement.tagName);  
			currentElement[eventName]=eventHandlerFunctionToBeCalled;
			
			// Store parameter within the element itself
			if (!currentElement.parameter)
				currentElement.parameter=new Object();
			currentElement.parameter[eventName]=eventHandlerFunctionParam;
		}
		catch(error){};
	}
	
    // Traverse the tree and assign the event handler to every descendants
    var i=0;
    var currentElementChild=currentElement.childNodes[i];
    while (currentElementChild)
    {
      propagateEventHandler(currentElementChild,  eventName, elementTagNameToAttachHandlerTo, eventHandlerFunctionToBeCalled, eventHandlerFunctionParam);
      i++;
      currentElementChild=currentElement.childNodes[i];
    }
  }
}
