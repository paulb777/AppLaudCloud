 /*!
 * jQuery UI Google Map 3.0-alpha
 * http://code.google.com/p/jquery-ui-map/
 * Copyright (c) 2010 - 2011 Johan Säll Larsson
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Depends:
 *      jquery.ui.map.js
 */
( function($) {

	$.extend($.ui.gmap.prototype, {
		 
		/**
		 * Gets the current position
		 * @param callback:function(position, status)
		 * @param geoPositionOptions:object, see https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIDOMGeoPositionOptions
		 */
		getCurrentPosition: function(a, b) {
			var c = this;
			if ( navigator.geolocation ) {
				navigator.geolocation.getCurrentPosition ( 
					function(position) {
						c._call(a, position, "OK");
					}, 
					function(error) {
						c._call(a, null, error);
					}, 
					b 
				);	
			} else {
				c._call(a, null, "NOT_SUPPORTED");
			}
		},
		
		/**
		 * Watches current position
		 * To clear watch, call navigator.geolocation.clearWatch(this.get('watch'));
		 * @param callback:function(position, status)
		 * @param geoPositionOptions:object, see https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIDOMGeoPositionOptions
		 */
		watchPosition: function(a, b) {
			var c = this;
			if ( navigator.geolocation ) {
				this.set('watch', navigator.geolocation.watchPosition ( 
					function(position) {
						c._call(a, position, "OK");
					}, 
					function(error) {
						c._call(a, null, error);
					}, 
					b 
				));	
			} else {
				c._call(a, null, "NOT_SUPPORTED");
			}
		}	
		
	
	});
	
} (jQuery) );