/**
 * ItpOverlay class
 * The class adds an overlay on elements of the page.
 * @author       Todor Iliev
 * @copyright    Copyright (C) 2010 Todor Iliev <todor@itprism.com>. All rights reserved.
 * @license      http://www.gnu.org/copyleft/gpl.html GNU/GPL
 */
function ItpOverlay (id) {
	
	this.id = id;
	
	/**
	 * Show the overlay
	 */
	this.show = function(id){
	  
	  if(id){
		  this.id = id;
	  }
	  
	  // Gets the object of the body tag
	  var bgObj = document.getElementById(this.id);
		
	  // Adds a overlay
	  var oDiv = document.createElement('div');
	  oDiv.setAttribute('id','itp_overlay');
	  oDiv.setAttribute("class", "black_overlay");
	  oDiv.style.display='block';
	  bgObj.appendChild(oDiv);
	  
	  // Adds loading
	  var lDiv = document.createElement('div');
	  lDiv.setAttribute('id','loading');
	  lDiv.setAttribute("class", "loading");
	  lDiv.style.display='block';
	  bgObj.appendChild(lDiv);
	  
	}

	/**
	 * Hide the overlay
	 */
	this.hide = function(id) {
		
		if(id){
			this.id = id;
		}
		
		var bgObj   = document.getElementById(this.id);
		
		// Removes loading 
		var element = document.getElementById('loading');
		bgObj.removeChild(element);
		
		// Removes a overlay box
		var element = document.getElementById('itp_overlay');
		bgObj.removeChild(element);
	}
	
}
