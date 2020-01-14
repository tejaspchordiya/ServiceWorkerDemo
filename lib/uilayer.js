/*!
 * UILayer JavaScript Library v2.3.0 01
 * 
 * Description: The file is a part of horizontal
 * component UILayer
 * 
 * Copyright 2015 eQTechnologic Pvt Ltd
 *
 * Date: 2016-07-08T07:23Z
 */
 
 
 
define('util/support',[], function () {
	var support = {};
	return support;
});
define('util/ua',[],function () {
/**
 * @description UILayer core module's user agent of browser information
 *
 */
	var ua = navigator.userAgent;
	
	return {
		"isiOSDevice": /iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua)
	};
});
define('util/config_pubsub',["require", "../lib"], function (require) {
/**
 * @description UILayer core module's pubsub for configuration of features and widgets
 * with pubsub uilayer delegates the respective feature to confugre itself. 
 * uilayer components registers itself on the pubsub to be eligible for configuration by client application
 * viseversa unregister itself from the process.
 * to configure application will either
 * uilayer.config(config)
 * Or
 * uilayer.config('component name', configuration object)
 *
 */
// essential set of variables and methods that all the features would require will be set
// in this file. Essentially it is core of uilayer.
	var Topics = {},// components === topics
		$ = require("jquery");
	
	return function (name) {
        var callbacks, method,
            topic = name && Topics[name];// component === topic
        if (!topic) {
            callbacks = $.Callbacks();
            topic = {// a topic for each component
                publish: callbacks.fire,
                subscribe: callbacks.add,
                unsubscribe: callbacks.remove
            };
            if (name) {
                Topics[name] = topic;
            }
        }
        return topic;
    };
});
define('util/config',["./config_pubsub"], function (config_pubsub) {
/**
 * UILayer core module configuration API. It is used to configure the UILayer
 * The configuration object is object holding various features and widgets configurations.
 * The api can accept 2 params string, object. here string is the feature name to be configured
 * and the object is configuration object.
 * Depends on module config_pubsub.
 * @exports configure
 */	
 var configure = function (config) {
		var name;
		if(arguments.length == 1) {
			for(name in config) {
				config_pubsub(name).publish(config[name]);
			}
		} else if(arguments.length == 2) {
			name = config, configObj = arguments[1];
			config_pubsub(name).publish(configObj);
		} else {
			throw Error("Error in configuration!");
		}
    };
 
 return configure;
});
/**
 * Created by yogeshwar on 12-09-2014.
 */
define( 'util/style',["jquery", "ccss-generator" ], function ( $, Generator ) {
    

    var generator = new window.Generator();

    function Style( cssJson ) {
        this.json = $.extend( {}, cssJson );
    }

    Style.prototype.toCSS = function () {
        var css = "",
			neutralize;
		$.each(this.json, function(cssprop, cssval){
			neutralize = cssprop + ": " + cssval + ";"
			css += (generator.generateFor( neutralize ) || neutralize);
		});
        return css;
    };

    return Style;
} );
/**
 * Created by swapnilb on 12/22/2014.
 */
define('util/styleSheetGenerator',['require','./style'],function(require) {
    

    var Style = require("./style");

    var StyleSheetGenerator = function() {
        this.styleId = null,
            this.sheet = null;
    };

/*
*   It creates style tag.
*   @param id : id of the style tag
*/
    StyleSheetGenerator.prototype.createStyleSheet = function(id) {

        this.styleId = id;
        this.sheet = this._createStyleSheet();
    };

    StyleSheetGenerator.prototype._createStyleSheet = function() {

        // Create the <style> tag
        var style = document.createElement("style");
        style.setAttribute("id", this.styleId);

        // WebKit hack :(
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.head.appendChild(style);

        return style.sheet;
    };

/*
*   It generates css class in style tag.
*   @param styleObject : Style JSON.
*   @param className : CSS class name.
*/
    StyleSheetGenerator.prototype.generateCSSRule = function (styleObject ,className ) {
        var style = this._convertToCSSStyle(styleObject );
		this.removeCssRules(["." + className]);
        this.addCssRule(("." + className), style);
    };

/*
 *   It coverts style json to css style.
 */
    StyleSheetGenerator.prototype._convertToCSSStyle = function (style ) {
        var uiStyle = new Style(style);
        return uiStyle.toCSS();
    };

/*
*   It adds CSS style in style tag.
*   @param selector : .Class name.
*   @param rules : CSS rules.
*   @param index : index of new CSS rule (appends at end if not provided).
*/
    StyleSheetGenerator.prototype.addCssRule = function(selector, rules, index) {

        if("insertRule" in this.sheet) {
            this.sheet.insertRule(selector + "{" + rules + "}", index);
        }
        else if("addRule" in this.sheet) {
            this.sheet.addRule(selector, rules, index);
        }
    };

    StyleSheetGenerator.prototype.removeCssRules = function(arrClassName) {
        var cssSelector;
        if(arrClassName && arrClassName.length > 0) {
            var cssRule = "rules", ruleIndex = -1;
            if(!("rules" in this.sheet)) {
                cssRule = "cssRules";
            }
            // Iterating over class names
            for(var index = 0; index < arrClassName.length; index++) {
                // Iterating over css rules
                for(ruleIndex = 0; ruleIndex < this.sheet[cssRule].length; ruleIndex++) {
                    cssSelector = this.sheet[cssRule][ruleIndex].selectorText.replace(/\"/g, "'");
                    if(cssSelector === arrClassName[index]) {
                        if("removeRule" in this.sheet) {
                            this.sheet.removeRule(ruleIndex);
                        }
                        else if("deleteRule" in this.sheet) {
                            this.sheet.deleteRule(ruleIndex);
                        }
                    }
                }
            }
        }
    };

    StyleSheetGenerator.prototype.destroy = function() {

        if(this.styleId && $( "#" + this.styleId ).length) {

            $( "#" + this.styleId ).remove();
            this.styleId = null;
            this.sheet = null;
        }
    };


    return StyleSheetGenerator;
});
define('util/extend',["jquery"], function ($) {
/**
 * @description UILayer core module's extends implementation
 * implements protoypal inheritance with construtor stealing
 * does not support for this._super like calls
 *
 */	return function (Supertype, SubtypePrototype, SubtypeStatic) {
                var prototype,
                    isSuperTypeFunc = (Supertype && $.isFunction(Supertype)),

                // Define a Subtype
                    Subtype = function () {
                        // If Super type is a function, Constructor stealing
                        if (isSuperTypeFunc) {
                            Supertype.apply(this, arguments);
                        }

                        if ($.isFunction(this._beforeInit)) {
                            this._beforeInit.apply(this, arguments);
                        }
                        // invoking constructor if provided in the SubtypePrototype
                        // with passed in attributes to the Subtype constructor
                        if ($.isFunction(this.init)) {
                            this.init.apply(this, arguments);
                        }

                        if ($.isFunction(this._onInit)) {
                            this._onInit.apply(this, arguments);
                        }
                    },

                    create = function (obj) {
                        var F = function () {
                        };
                        F.prototype = obj;
                        return new F();
                    };

                // extend static properties
                $.extend(Subtype, Supertype, SubtypeStatic);

                // If Super type is a function, prototype inheritance
                if (isSuperTypeFunc) {
                    prototype = create(Supertype.prototype);
                    prototype.constructor = Subtype;
                    Subtype.prototype = prototype;
                }

                // merging passed in prototype object literal with Subtype prototype
                $.extend(Subtype.prototype, SubtypePrototype);

                return Subtype;
            }
});
/**
 * Created by yogeshwar on 15-01-2015.
 */
define( 'util/cssConverter',['require','jquery'],function( require ) {
    
    var $ = require( "jquery" ),
        base = 16;

    $( function() {
        if ( document ) {
            base = parseInt($("html").css("font-size"));
        }
    } );

    function convert( value, toUnit ) {
        var typeValue = typeof value,
            fromUnit, nValue, toUnitValue;

        // possible to convert only string and numeric values
        if ( typeValue !== "string" && typeValue !== "number" ) {
            //throw new Error("Only css length values of type string with suffix unit is supported.");
            console.log( "Return value as is since value passed for conversion is " +
            "neither number nor string.");
            return value;
        } else if ( (typeValue === "string" && value.trim().length === 0) ) {
			console.log( "Return value as is since empty value passed for conversion.");
            return value;
        }

        if( typeValue === "number" ) {
            nValue = value;
        } else {
            nValue = value.match( /^(-)?(\d*)(\.)?(\d*)/i );
            fromUnit = value.match( /(\D+)$/i );
        }
        fromUnit = $.isArray( fromUnit ) ? fromUnit[0] : "px";
        nValue = $.isArray( nValue ) ? nValue[0] : nValue;

        // if already in the target unit format
        if ( typeof nValue === "undefined" || typeof toUnit !== "string" ) {
            // throw new Error( "Cannot convert " + value +
            // " of format " + fromUnit + " to " + toUnit + " format." );
			console.log( "Cannot convert " + value +
            " to " + toUnit + " format. Invalid value or toUnit." );
			return value;
        } 

		if ( fromUnit.match( new RegExp( toUnit, "i" ) ) ) {
            return value;
        }
        toUnitValue = nValue;
        // now convert
        switch ( toUnit.toLowerCase() ) {
            case "rem":// to rem
                if ( fromUnit.toLowerCase() === "px" ) {
                    toUnitValue = parseFloat( nValue ) / parseFloat( base );
                }
                break;
            case "px":
                if ( fromUnit.toLowerCase() === "rem" ) {
                    toUnitValue = parseFloat( nValue ) * parseFloat( base );
                }
                if ( fromUnit.toLowerCase() === "pt" ) {
                    toUnitValue = parseFloat( parseFloat( nValue ) / 0.75 );
                }
                if ( fromUnit.toLowerCase() === "inch" ) {
                    toUnitValue = parseFloat( parseFloat( nValue ) *  96 );
                }
				toUnitValue = Math.round(toUnitValue);
                break;

            case "pt":
                if ( fromUnit.toLowerCase() === "px" ) {
                    toUnitValue = parseFloat( parseFloat( nValue ) * 0.75 );
                }
                break;
            case "inch":
                if ( fromUnit.toLowerCase() === "px" ) {
                    toUnitValue = parseFloat( parseFloat( nValue ) * 0.01 );
                }
                break;
            default:
                throw new Error( "Unit " + toUnit + " is not supported" );
        }

        return toUnitValue + toUnit.toLowerCase();
    }


    return {
        unit: convert
    };
} );
/**
 * Created by yogeshwar on 02-07-2015.
 */
define( 'util/string.format',[],function( ) {
    // is format avaialble
    if ( !String.prototype.format ) {
        String.prototype.format = function() {
            var params,
                regEx;

            if( $.isPlainObject(arguments[0])){
                params = arguments[0];
                regEx = /\[([^\]]+)\]/g;
            }
            else {
                params = arguments;
				regEx = /{(\d+)}/g;
            }
            return this.replace(regEx,function(match,string){
                return typeof params[string] != 'undefined'
                    ? params[string]
                    : match;
            });
        };
    }
    return String.prototype.format;
});
define( 'util/stopBackspaceNavigation',["jquery"], function ( $ ) {
	
	var backspace,
		excludeSelector = "input, select, textarea, [contenteditable='true']",
        includeSelector = ":checkbox, :radio, :submit, input[type='button'], input[type='reset']";
 
	function enable( enable, options ) { 
		if( typeof enable !== "boolean" ) {
			options = enable;
			enable = true;
		}
		if( typeof options === "object" ) {
			excludeSelector = options.excludeSelector || excludeSelector;
			includeSelector = options.includeSelector || includeSelector;
		}
		// off earlier event
		$( document ).off( "keydown", stopBackspaceNavigation )
		// and then add new one if required
		if( enable ) {
			$( document ).on( "keydown", stopBackspaceNavigation );
		}
		backspace.enabled = enable;
	}
	
	function stopBackspaceNavigation( e ) {
		var target = e.target
			$target = $( target );
		
		if( e.which == 8 ){ // 8 == backspace
            if( !$target.is( excludeSelector ) || 
				$target.is( includeSelector ) || 
				target.disabled || target.readOnly ) {
                e.preventDefault();
            }
        }
	}
	/**
	 * @exports backspace
	 */	
	backspace = {
		enable: enable,
		enabled: false
    };
	return backspace;
} );
/**
 * @file uilayer core module Object defines essential set of variables and methods that 
 * all the features would require will be set.
 *
 */
define('core',[
	"./lib", 
	"./util/support", 
	"./util/ua", 
	"./util/config", 
	"./util/style",
    "./util/styleSheetGenerator",
	"./util/extend",
	"./util/cssConverter",
    "./util/string.format",
	"./util/stopBackspaceNavigation"
], function (lib, support, navigatorObj, config, Style, StyleSheetGenerator, extend, cssConverter, format, stopBackspaceNavigation) {
    
	
	// lib module loads all the libraries required.
	// in callback refer to required library
	var $ = require("jquery");
	
    var util = {},
	/**
     * <i>uilayer</i> is not DOM manipulation library like jquery, it
     * does not have to hold state like jQuery or jQueryUI widgets, it 
     * does not expect to have many instances of uilayer on a page like jquery.
     * It is simple wrapper for UI utilities, features of different development 
	 * problems ajax, data collection. uilayer core module Object defines essential 
	 * set of variables and methods that all the features would require will be set.
	 * @exports uilayer
	 */
        uilayer = window.uilayer = {
			//Since we never required to maintain state we would implement it as a singleton class
			// we could initialize it with {} notation
            "version": "@version",
			/** utilities functions such as extend */
            "util": util,
			/** browser features support verifier module */
            "support": support,
			/** browser/device information object */
            "navigator": navigatorObj,
            /** wrapped template API. using underscore's template */
            "template": require("underscore").template,
            "messages": {},
			/**
			 * Configures uilayer.
			 * @see {@link module:config}
			 * @example uilayer.config("ajax", { preAjaxProcessor: function(xhr) {}})
			 * @method
			 */
            "config": config,
            /** */
            "Style": Style,
            "StyleSheetGenerator": StyleSheetGenerator,
            "cssConverter": cssConverter,
            "strFormat": format,
			"stopBackspaceNavigation": stopBackspaceNavigation
        };
	util.extend = extend;
	
	stopBackspaceNavigation.enable()
    // set versions
    // here jquery has set up array util, overrides, extend kind of utils
    // regular expressions required for itself
    return uilayer;
});
define( 'uilayer/ajax/ajax',["jquery", "../../core", "../../util/config_pubsub"],
    function( $, uilayer, configPubsub ) {

        
        /**
         * @external jquery
         * @see {@link http://jquery.com}
         */

        /*
         * All processor objects hash are key-value pair, where key is identifier
         * name, and the value is processor callback function.
         */
        /**
         * An object hash maintaining processor callback functions to be executed
         * 'before ajax request'. The application can add 'before ajax request'
         * callback function through `configure` object.
         * @type {Object}
         * @private
         */
        var beforeSendProcessors = {},

            /**
             * An object hash maintaining processor callback functions to be executed
             * 'after ajax request' returns successfully. The application can add 'after
             * success ajax request' processor callback function through `configure`
             * object.
             * @type {Object}
             * @private
             */
            afterSuccessProcessors = {},

            /**
             * An object hash maintaining processor callback functions to be executed
             * 'after ajax request' returns erroneously. The application can add 'after
             * erroneous ajax request' processor callback function through `configure`
             * object.
             * @type {Object}
             * @private
             */
            afterErrorProcessors = {},

            /**
             * An object hash maintaining processor callback functions to be executed
             * 'after ajax request' returns (either successfully or erroneously). The
             * application can add 'after ajax request' processor callback function
             * through `configure` object, if application has to execute them in any
             * case after ajax request returns.
             * @type {Object}
             * @private
             */
            afterCompleteProcessors = {},

            /**
             * An array of processor callback function identifiers which should not be
             * executed, that is disabled. Application can configure this array with
             * 'disabledProcessors' setting of configure object.
             * @type {Array}
             * @private
             */
            disableProcessors = [],

            /**
             * @description Wraps the original beforeSend callback
             * with uilayer's beforeSend processing.
             * It will iterate over `beforeSendProcessors` object and execute each processor
             * callback function in turn. If any (application or uilayer's) of the
             * beforeSend processing returns false next beforeSend processing will not be
             * executed and function will return false, in turn the Ajax request will be
             * canceled.
             * @param {Object} options All options of a AJAX request
             * @private
             */
            wrapBeforeSend = function( options ) {
                // developer's beforeSend
                var beforeSend = options.beforeSend;
                // uilayers beforeSend wrapping developers beforeSend
                options.beforeSend = function() {
                    var retValue;
                    // execute developers before send first
                    if ( typeof beforeSend === "function" ) {
                        retValue = beforeSend.apply( this, arguments );
                        // if developer's beforeSend returns false
                        // ajax call should be cancelled
                        // so returning false
                        if ( retValue === false ) {
                            return retValue;
                        }
                    }

                    // executing registered before send processors
                    for ( var propName in beforeSendProcessors ) {
                        // if not disabled
                        if ( disableProcessors.indexOf( propName ) === -1 ) {
                            retValue = beforeSendProcessors[propName].apply( this, arguments );
                            if ( retValue === false ) {
                                return retValue;
                            }
                        }
                    }
                };
            },

            /**
             * @description Wrap the original success callback
             * with uilayer's success processing.
             * It will iterate over the `afterSuccessProcessors` object and execute each
             * processor in turn. If any of success processor has modified data or xhr
             * object, it will be available into next success callback function and in turn
             * developers success callback.
             * @param {Object} options All options of a AJAX request
             * @private
             */
            wrapSuccess = function( options ) {
                //store developer's success for later execution
                var success = options.success;

                /*processing uilayer's post processing
                 iterating over afterSuccessProcessors hash*/
                options.success = function( data, textStatus, jqXHR ) {
                    for ( var propName in afterSuccessProcessors ) {
                        if ( disableProcessors.indexOf( propName ) === -1 ) {
                            afterSuccessProcessors[propName]( data, textStatus, jqXHR );
                        }
                    }

                    // if there is some developer's processing
                    // in the success callback execute it
                    if ( typeof success === "function" ) {
                        success.apply( this, arguments );
                    }
                    else if ( $.isArray( success ) ) {
                        for ( var i = 0; i < success.length; i += 1 ) {
                            if ( typeof success[i] === "function" ) {
                                success[i].apply( this, arguments );
                            }
                        }
                    }
                };
            },

            /**
             * @description Wrap the original error callback with uilayer's error processing.
             * First it executes original error callback. Then it will iterate over
             * the `afterErrorCallbacks` object. Checks if a error callback is enabled.
             * If yes, executes the error callback. The flow of executing developers
             * error callback first is to allow the developer to handle error and marks
             * it has handled the error. This mark is expected be used by exception
             * handling feature to make decision whether to handle the error.
             * @param {Object} options All options of a AJAX request
             * @private
             */
            wrapError = function( options ) {
                //store developer's fail for later execution
                var error = options.error;

                //processing eQUILayer's post processing iterating over postAjaxRequest hash
                options.error = function( jqXHR, textStatus, errorThrown ) {
                    // if there is some developer's processing in the fail callback execute it
                    if ( typeof error === "function" ) {
                        error.apply( this, arguments );
                    }
                    else if ( $.isArray( error ) ) {
                        for ( var i = 0; i < error.length; i += 1 ) {
                            if ( typeof error[i] === "function" ) {
                                error[i].apply( this, arguments );
                            }
                        }
                    }

                    for ( var propName in afterErrorProcessors ) {
                        if ( disableProcessors.indexOf( propName ) === -1 ) {
                            afterErrorProcessors[propName]( jqXHR, textStatus, errorThrown );
                        }
                    }
                };
            },

            /**
             * @description Wraps the original complete callback with uilayer's complete
             * processing. It will iterate over the `afterCompleteProcessors` object.
             * Checks if the afterCompleteProcessor is enabled. If it is enabled,
             * execute it. In the end call the original complete.
             * @param {Object} options All options of a AJAX request
             * @private
             */
            wrapComplete = function( options ) {
                //store developer's complete for later execution
                var complete = options.complete;

                //processing eQUILayer's post processing iterating over postAjaxRequest hash
                options.complete = function( jqXHR, textStatus ) {

                    for ( var propName in afterCompleteProcessors ) {
                        if ( disableProcessors.indexOf( propName ) === -1 ) {
                            afterCompleteProcessors[propName]( jqXHR, textStatus );
                        }
                    }

                    // if there is some developer's processing
                    // in the complete callback execute it
                    if ( typeof complete === "function" ) {
                        complete.apply( this, arguments );
                    }
                    else if ( $.isArray( complete ) ) {
                        for ( var i = 0; i < complete.length; i += 1 ) {
                            if ( typeof complete[i] === "function" ) {
                                complete[i].apply( this, arguments );
                            }
                        }
                    }

                };
            },

            originalAjax = $.ajax;

        /**
         * @description Perform default setups for AJAX requests.
         * Preferred way of communication to server is using JSON data.
         * So setting default options for every AJAX using.
         * $.ajaxSetup.
         */
        $.ajaxSetup( {
            "contentType": "application/json",
            // "accepts": "application/json", // Commented as the header
												// is set by the jQuery depending on the datatype
            "dataType": "json",
            "cache": false,
            "timeout": 240000
        } );

        /**
         * AjaxPrefilter is used instead of overriding $.ajax.
         *
         * Earlier way of overriding has issues when used with third party libraries.
         * Third party libraries that possibly loaded before uilayer can copy $.ajax
         * locally as Backbone and kendo does. That is where, the overriding mechanism
         * fails and expected wrappers of uilayer would not add to the ALL requests.
         *
         * ajaxPrefilter configuration would be applied to all AJAX calls in the page.
         * Whenever UILayer loads in the page, whether any library copies or loads after
         * or before, all requests would be updated with beforeSend, success, complete
         * and error handlers of UILayer.
         */
		$.ajaxPrefilter(function( options ) {
            /**
             * It is required to implement  UI Layer's own success n error complete
             * callbacks for pre and post request processing of every AJAX request so
             * that $.ajax remain unchanged. So global events of jQuery.ajax are not
             * used.

             * change beforeSend method set in options with  UI layers' implementation
             * so that  UI Layer can decide to invoke pre processors before each AJAX
             * request.
             */
            wrapBeforeSend( options );

            /**
             * change success method with uilayer's implementation,
             * to invoke different post-processing if any, after each AJAX.
             */
            wrapSuccess( options );

            /**
             * change error method with uilayer's implementation,
             * to invoke different post-processing if any, after each AJAX.
             */
            wrapError( options );

            /**
             * change complete method for invoking the post-processing logic irrespective of
             * whether the AJAX call was a success or a failure
             */
            wrapComplete( options );
		});

        /**
         * @description UI Layer ajax module function, wraps jQuery.ajax to perform some before
         * and after ajax request operations on request headers/data and response data
         * or handle error responses.
         * For example, uilayer's before ajax request processor includes
         * security handling, after ajax request processor inlcudes exception
         * handling. These ajax request processors executes for all ajax request
         * made using this module function.
         * <br>
         * The intention of module function is not to suppress any of jQuery.ajax
         * functioning, so developer can add callbacks or promise callback functions
         * or listens to global events of jQuery.ajax.
         * <br>
         * Application can configure application specific before and after
         * ajax request processors.
         * @link {uilayer.configure}
         *
         * @module uilayer.ajax
         * @param {object} options - Similar to jQuery.ajax's options settings
         * @exports uilayer.ajax
         * @requires jQuery
         * @requires core
         * @requires config_pubsub
         * @returns jQuery's promise xhr object
         * @author shruti, yogeshwar
         * @version 0.1
         */
        $.ajax = uilayer.ajax = function( options ) {
            var xhr = originalAjax.call( $, options );

            // return XHR promise object if others needed it
            return xhr;
        };

        /**
         * @description This method adds the beforeSendProcessors
         * @param {Function} value beforeSend pre-processor
         */
        function addBeforeSendProcessors( value ) {
            for ( var propName in value ) {
                if ( typeof value[propName] === "function" ) {
                    beforeSendProcessors[propName] = value[propName];
                }
            }
        }

        /**
         * @description This method adds the afterSuccessProcessors
         * @param {Function} value after success post-processor
         */
        function addAfterSuccessProcessors( value ) {
            for ( var propName in value ) {
                if ( typeof value[propName] === "function" ) {
                    afterSuccessProcessors[propName] = value[propName];
                }
            }
        }

        /**
         * @description This method adds the afterErrorProcessors
         * @param {Function} value after error post-processor
         */
        function addAfterErrorProcessors( value ) {
            for ( var propName in value ) {
                if ( typeof value[propName] === "function" ) {
                    afterErrorProcessors[propName] = value[propName];
                }
            }
        }

        /**
         * @description This method adds the afterCompleteProcessors
         * @param {Function} value after complete post-processor
         */
        function addAfterCompleteProcessors( value ) {
            for ( var propName in value ) {
                if ( typeof value[propName] === "function" ) {
                    afterCompleteProcessors[propName] = value[propName];
                }
            }
        }

        /**
         * Listener for configuration.
         * A communication medium between the different features of uilayer.
         * This event will give the features access to the configure object.
         * Configure object has the uilayer's various application level settings
         * which are useful for different features.
         * Here, Ajax listens 'configure', to access the developer's pre and post ajax
         * processing objects for a particular application and adds them to the existing
         * array of beforeSendProcessors, postDoneProcessing, postFailProcessing,
         * afterCompleteProcessors respectively.
         * Also from configure object we get information regarding
         * which pre and post ajax requests are disabled by the developer.
         */
        configPubsub( "ajax" ).subscribe( function( config ) {
            // check the configuration object for pre request configs
            if ( $.isPlainObject( config.beforeSendProcessors ) ) {
                addBeforeSendProcessors( config.beforeSendProcessors );
            }

            // check the configuration object for post done request configs
            if ( $.isPlainObject( config.afterSuccessProcessors ) ) {
                addAfterSuccessProcessors( config.afterSuccessProcessors );
            }

            // check the configuration object for post fail request configs
            if ( $.isPlainObject( config.afterErrorProcessors ) ) {
                addAfterErrorProcessors( config.afterErrorProcessors );
            }

            if ( $.isPlainObject( config.afterCompleteProcessors ) ) {
                addAfterCompleteProcessors( config.afterCompleteProcessors );
            }

            // check for disabled pre Ajax requests from the config object and
            // copy the array in local disableProcessors array if one exists
            if ( $.isArray( config.disableProcessors ) ) {
                disableProcessors = config.disableProcessors;
            }


            if( config.ajaxRequestTimeout && parseInt( config.ajaxRequestTimeout ) ) {
                $.ajaxSetup( {
                    "timeout": parseInt( config.ajaxRequestTimeout )
                } );
            }

        } );
        return uilayer.ajax;
    } );



/**
 * Created by sonam on 25-04-2016.
 */

define( 'uilayer/ui/confirmbox',["../../core" ], function( uilayer ) {
    /**
     * @description API to show a confirmation window with an OK and Cancel button.
     * @param {String} message message that will be shown on the confirmation window.
     * @param {Function} okCallback callback that will be executed when OK button is clicked.
     * @param {Function} cancelCallback callback that will be executed
     * when CANCEL button is clicked.
     * @public
     */

    var confirmWin=null,
        CONFIRMATION_WIN = "confirmation-win",
        bundle = $.extend( true, window.uilayer.messages, {
            "confirmTitle": "Confirm",
            "ok":"Ok",
            "cancel":"Cancel"
        }),
		okCallBack = $.noop,
        cancelCallBack = $.noop,
        isOpen;

    function createConfirmTemplate( message ) {
        return "<div class='ul-confirm-content'>" +
            "<span class='ul-i-confirm' />" +
            "<span class='ul-confirm-msg'>" + message + "</span>" +
            "</div>";
    }

    function ok(){
        okCallBack();
        cleanConfirmCallbacks();
    }

    function close( e ) {
        // click cancel button -> close() -> close event || click X -> close event
        if ( typeof e.userTriggered === 'undefined' ||  e.userTriggered ) {
            cancelCallBack();
            cleanConfirmCallbacks();
        }
        isOpen = false;
    }

    function cleanConfirmCallbacks() {
        okCallBack = cancelCallBack = $.noop;
    }

    function createConfirmationWindow() {
        var confirmWinTemplate = "<div id = " + CONFIRMATION_WIN + "></div>";

        if ( confirmWin ) {
            confirmWin.destroy();
        }
        confirmWin = uilayer.extWindow( {
            elem: $( confirmWinTemplate ),
            modal: true,
            defaultButtons: ["ok", "cancel"],
            visible: false,
            resizable: false,
            width: 500,
            ok: $.proxy( ok, confirmWin ),
            cancel: $.proxy( close, confirmWin ),
            close: $.proxy( close, confirmWin )
        } );
    }



    uilayer.confirm = function( message, title, okCallback, cancelCallback, buttonLabels ) {
        if( isOpen ) {
            //return if confirmation window is already open
            return confirmWin.$el;
        }

        if ( typeof title !== "string" ) {
            buttonLabels = cancelCallback;
            cancelCallback = okCallback;
            okCallback = title;
            title = bundle.confirmTitle;
        }
        var win,
            defer = $.Deferred();

        if ( confirmWin === null ) {
            require( ["widgets"], function() {
                createConfirmationWindow();
                win = _confirm( message, title, okCallback, cancelCallback, buttonLabels );
                defer.resolve( win );
            } );
        }
        else {
            defer.resolve( _confirm( message, title, okCallback, cancelCallback, buttonLabels ) );
        }
        return defer.promise();
    };

    function _confirm( message, title, okCallback, cancelCallback, buttonLabels ) {

        confirmWin.setActionLabel( "ok", buttonLabels ? buttonLabels[0] : bundle.ok );
        confirmWin.setActionLabel( "cancel", buttonLabels ? buttonLabels[1] : bundle.cancel );

        confirmWin.content( createConfirmTemplate( message ) );
        confirmWin.title( title );
        okCallBack = okCallback || $.noop;
        cancelCallBack = cancelCallback || $.noop;
        confirmWin.center().open();
        isOpen = true;
        return confirmWin.$el;
    }
});
define( 'uilayer/databinding/databinding',["underscore", "backbone", "stickit"], function( _, Backbone ) {
    
    /**
     * @external backbone.stickit
     * @see {@link https://github.com/NYTimes/backbone.stickit}
     */

    /**
     * @description A custom handler to handle the binding
     * of custom widgets like datepicker, slider etc
     */
    Backbone.Stickit.addHandler( {
        selector: ".eq-widget",
        events: ["wgt:change"],
        update: function( $el, val ) {
            $el.data( "uilayer-wgt" ).value( val );
        },
        getVal: function( $el ) {
            return $el.data( "uilayer-wgt" ).value();
        }
    } );

    /**
     * @description Databinding between a model and view
     * @module Databinding
     * @requires underscore
     * @requires backbone
     * @requires stickit
     * @author shruti, yogeshwar
     * @version 0.1
     */
    _.extend( Backbone.View.prototype, {
        autoSync: true,

        /**
         * @description This API binds the model and the view and thus keeps both in sync
         * @memberOf module:Databinding#
         * @param optionalModel {Object} Bind view with an optional model
         * i.e other than default model of a view.
         * @param optionalBindingsConfig {Object} Bindings other than
         * the default view bindings.
         * @example
         * //A SampleModel and SampleView are defined as follows
         * var SampleModel = Backbone.Model.extend({
             *      defaults:{
             *          firstName: "John",
             *          lastName: "Smith"
             * });
             * var SampleView = Backbone.View.extend({
             *      bindings:{
             *          "#firstName": "firstName",
             *          "#lastName":"lastName"
             *      },
             *      render:function(){
             *          this.bind();
             *      }
             * });
             * //A model instance which we will bind with the SampleView instance
             * var sampleModel = new SampleModel();
             *
             * //In some view we make an instance of SampleView
             * var sampleView = new SampleView({
             *      model: sampleModel
             * });
             *
             * //Thus sampleView is in sync with sampleModel and vice versa
             *
             * @public
         */
        bind: function( optionalModel, optionalBindingsConfig ) {
            var autoSync = this.autoSync;

            // if not synced automatically, delayed sync till sycnModel is called
            if ( !autoSync ) {
                this._modelCidToDummy || (this._modelCidToDummy = {});
                this._dummyCidToModel || (this._dummyCidToModel = {});
                var model = optionalModel || this.model,
                    bindings = optionalBindingsConfig || this.bindings,
                    dummyModel = this._getDummyModel( model ),
                    remove = this.remove;
                /*
                 Wrap `view.remove` to unbind stickit model, dom events
                 and delete the dummy models used in sync
                 Keep this remove consistent with different
                 versions of remove overriden by stickit.
                 */
                // TODO : Can we overcome this maintainence
                if ( !remove.stickitWrapped ) {
                    this.remove = function() {
                        var ret = this;
                        this.unstickit();
                        this._deleteModelListeners();
                        delete this._modelCidToDummy;
                        delete this._dummyCidToModel;
                        if ( remove ) {
                            ret = remove.apply( this, arguments );
                        }
                        return ret;
                    };
                }

                this.remove.stickitWrapped = true;

                this.stickit( dummyModel, bindings );
            }
            else {
                this.stickit.apply( this, arguments );
            }
        },

        /**
         * @description To use delayedBinding, we are creating a dummy model
         * to bind with the view elements which will be in sync instead of the original model.
         * Later on syncModel API will update the original model.
         * @param model {Object} original model which will be synced
         * after syncModel API is called.
         * @returns {*}
         * @private
         */
        //
        _getDummyModel: function( model ) {
            var dummyModel = this._modelCidToDummy[model.cid];// model.cid -> dummyModel
            if ( !dummyModel ) {
                dummyModel = cloneModel( model.attributes );
                this._modelCidToDummy[model.cid] = dummyModel;// model.cid 		-> dummyModel
                this._dummyCidToModel[dummyModel.cid] = model;// dummyModel.cid -> model
                // add listners for keeping dummyModel with model
                this._addModelListener( model, dummyModel );
            }
            return dummyModel;
        },

        /**
         * @description add event listeners on original model to update the dummyModel
         * @param model {Object} original model which will be
         * synced after syncModel API is called.
         * to update the original model after syncModel API is called.
         * @private
         */
        _addModelListener: function( model ) {
            // for changes on model be reflected on screen
            model.on( "change", this._syncDummyModel, this );
        },

        /**
         * @description on unbinding remove all _syncDummyModel listeners.
         * @private
         */
        _deleteModelListeners: function() {
            _.each( this._dummyCidToModel, function( model ) {
                model.off( "change", this._syncDummyModel );
            }, this );
        },

        /**
         * @description change listener for model to update dummyModel.
         * @param model original model which will be synced after syncModel API is called.
         * @private
         */
        _syncDummyModel: function( model ) {
            if ( model instanceof Backbone.Model ) {
                this._modelCidToDummy[model.cid].set( model.toJSON() );
            }
        },

        /**
         * @description This API updates the model with the view values
         * when autoSync property of view is set to false
         * @memberOf module:Databinding#
         * @public
         * @example
         *
         * //A SampleModel and SampleView are defined as follows
         * var SampleModel = Backbone.Model.extend({
             *      defaults:{
             *          firstName: "John",
             *          lastName: "Smith"
             * });
             *
             * var SampleView = Backbone.View.extend({
             *      // By default this value is true.
             *      // If set to false means the model is not bound with the view.
             *      // When syncModel API s called model will update the values according to view
             *      autoSync: false,
             *
             *      events: {
             *          "click #syncModel" : "syncWithModel"
             *      },
             *
             *      bindings:{
             *          "#firstName": "firstName",
             *          "#lastName":"lastName"
             *      },
             *
             *      render:function(){
             *          this.bind();
             *      },
             *
             *      syncWithModel: function(event){
             *      // on some buttons click the model is updated with the new values of view
             *          this.syncModel();
             *      }
             * });
             *
             * //A model instance which we will bind with the SampleView instance
             * var sampleModel = new SampleModel();
             *
             * //In some view we make an instance of SampleView
             * var sampleView = new SampleView({
             *      model: sampleModel
             * });
             *
             * //Thus sampleModel is in sync with the view when syncModel API is called
             */
        syncModel: function() {
            _.each( this._modelCidToDummy, function( dummyModel ) {
                this._dummyCidToModel[dummyModel.cid].set( dummyModel.toJSON() );
            }, this );
        },

        /**
         * @description This API unbinds the model and view and thus they will not be in sync
         * @memberOf module:Databinding#
         * @public
         */
        unbind: function() {
            this.unstickit.apply( this, arguments );
        }
    } );

    /**
     * @description This method makes a clone model of nested attributes of a Backbone.Model
     * @param attributes {Object} The nested attributes of a model
     * @returns {Backbone.Model} Clone model of nested attributes of a model
     */
    function cloneModel( attributes ) {
        var newAttributes = {};
        _.each( attributes, function( value, key ) {
            if ( !(value instanceof Backbone.Model) ) {
                newAttributes[key] = value;
            }
        } );
        return new Backbone.Model( newAttributes );
    }
} );


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  SHA-256 implementation in JavaScript | (c) Chris Veness 2002-2010 | www.movable-type.co.uk    */
/*   - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                             */
/*         http://csrc.nist.gov/groups/ST/toolkit/examples.html                                   */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Sha256 = {};  // Sha256 namespace

/**
 * Generates SHA-256 hash of string
 *
 * @param {String} msg                String to be hashed
 * @param {Boolean} [utf8encode=true] Encode msg as UTF-8 before generating hash
 * @returns {String}                  Hash of msg as hex character string
 */
Sha256.hash = function(msg, utf8encode) {
    utf8encode =  (typeof utf8encode == 'undefined') ? true : utf8encode;
    
    // convert string to UTF-8, as SHA only deals with byte-streams
    if (utf8encode) msg = Utf8.encode(msg);
    
    // constants [?.2.2]
    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
             0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
             0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
             0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
             0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
             0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
             0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
             0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    // initial hash value [?.3.1]
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

    // PREPROCESSING 
    msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [?.1.1]

    // convert string msg into 512-bit/16-integer blocks arrays of ints [?.2.1]
    var l = msg.length/4 + 2;  // length (in 32-bit integers) of msg + ??+ appended length
    var N = Math.ceil(l/16);   // number of 16-integer-blocks required to hold 'l' ints
    var M = new Array(N);

    for (var i=0; i<N; i++) {
        M[i] = new Array(16);
        for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
            M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) | 
                      (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // add length (in bits) into final pair of 32-bit integers (big-endian) [?.1.1]
    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
    M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14])
    M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;


    // HASH COMPUTATION [?.1.2]

    var W = new Array(64); var a, b, c, d, e, f, g, h;
    for (var i=0; i<N; i++) {

        // 1 - prepare message schedule 'W'
        for (var t=0;  t<16; t++) W[t] = M[i][t];
        for (var t=16; t<64; t++) W[t] = (Sha256.sigma1(W[t-2]) + W[t-7] + Sha256.sigma0(W[t-15]) + W[t-16]) & 0xffffffff;

        // 2 - initialise working variables a, b, c, d, e, f, g, h with previous hash value
        a = H[0]; b = H[1]; c = H[2]; d = H[3]; e = H[4]; f = H[5]; g = H[6]; h = H[7];

        // 3 - main loop (note 'addition modulo 2^32')
        for (var t=0; t<64; t++) {
            var T1 = h + Sha256.Sigma1(e) + Sha256.Ch(e, f, g) + K[t] + W[t];
            var T2 = Sha256.Sigma0(a) + Sha256.Maj(a, b, c);
            h = g;
            g = f;
            f = e;
            e = (d + T1) & 0xffffffff;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) & 0xffffffff;
        }
         // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
        H[0] = (H[0]+a) & 0xffffffff;
        H[1] = (H[1]+b) & 0xffffffff; 
        H[2] = (H[2]+c) & 0xffffffff; 
        H[3] = (H[3]+d) & 0xffffffff; 
        H[4] = (H[4]+e) & 0xffffffff;
        H[5] = (H[5]+f) & 0xffffffff;
        H[6] = (H[6]+g) & 0xffffffff; 
        H[7] = (H[7]+h) & 0xffffffff; 
    }

    return Sha256.toHexStr(H[0]) + Sha256.toHexStr(H[1]) + Sha256.toHexStr(H[2]) + Sha256.toHexStr(H[3]) + 
           Sha256.toHexStr(H[4]) + Sha256.toHexStr(H[5]) + Sha256.toHexStr(H[6]) + Sha256.toHexStr(H[7]);
}

Sha256.ROTR = function(n, x) { return (x >>> n) | (x << (32-n)); }
Sha256.Sigma0 = function(x) { return Sha256.ROTR(2,  x) ^ Sha256.ROTR(13, x) ^ Sha256.ROTR(22, x); }
Sha256.Sigma1 = function(x) { return Sha256.ROTR(6,  x) ^ Sha256.ROTR(11, x) ^ Sha256.ROTR(25, x); }
Sha256.sigma0 = function(x) { return Sha256.ROTR(7,  x) ^ Sha256.ROTR(18, x) ^ (x>>>3);  }
Sha256.sigma1 = function(x) { return Sha256.ROTR(17, x) ^ Sha256.ROTR(19, x) ^ (x>>>10); }
Sha256.Ch = function(x, y, z)  { return (x & y) ^ (~x & z); }
Sha256.Maj = function(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }

//
// hexadecimal representation of a number 
//   (note toString(16) is implementation-dependant, and  
//   in IE returns signed numbers when used on full words)
//
Sha256.toHexStr = function(n) {
  var s="", v;
  for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
  return s;
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2010                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {};  // Utf8 namespace

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
 * (BMP / basic multilingual plane only)
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
 *
 * @param {String} strUni Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
Utf8.encode = function(strUni) {
  // use regular expressions & String.replace callback function for better efficiency 
  // than procedural approaches
  var strUtf = strUni.replace(
      /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
    );
  strUtf = strUtf.replace(
      /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0); 
        return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
    );
  return strUtf;
}

/**
 * Decode utf-8 encoded string back into multi-byte Unicode characters
 *
 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
 * @returns {String} decoded string
 */
Utf8.decode = function(strUtf) {
  // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
  var strUni = strUtf.replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
        return String.fromCharCode(cc); }
    );
  strUni = strUni.replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
        return String.fromCharCode(cc); }
    );
  return strUni;
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */




/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/Sha256 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
function hex_hmac_md5(k, d)
  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function b64_hmac_md5(k, d)
  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function any_hmac_md5(k, d, e)
  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }


function replaceNewLinePostEncoding( allValues){
	var tmp = encodeURIComponent(allValues);
	var tmp1 = replaceAll(tmp,"%0D","");// carriage return
	tmp1 = replaceAll(tmp1,"%0A","");// line feed
	return tmp1;
}

function replaceAll(txt, replace, with_this) {
  return txt.replace(new RegExp(replace, 'g'),with_this);
}

/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s)
{
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
 * Calculate the HMAC-MD5, of a key and some data (raw strings)
 */
function rstr_hmac_md5(key, data)
{
  var bkey = rstr2binl(key);
  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input)
{
  try { hexcase } catch(e) { hexcase=0; }
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var output = "";
  var x;
  for(var i = 0; i < input.length; i++)
  {
    x = input.charCodeAt(i);
    output += hex_tab.charAt((x >>> 4) & 0x0F)
           +  hex_tab.charAt( x        & 0x0F);
  }
  return output;
}

/*
 * Convert a raw string to a base-64 string
 */
function rstr2b64(input)
{
  try { b64pad } catch(e) { b64pad=''; }
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var output = "";
  var len = input.length;
  for(var i = 0; i < len; i += 3)
  {
    var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
    }
  }
  return output;
}

/*
 * Convert a raw string to an arbitrary string encoding
 */
function rstr2any(input, encoding)
{
  var divisor = encoding.length;
  var i, j, q, x, quotient;

  /* Convert to an array of 16-bit big-endian values, forming the dividend */
  var dividend = Array(Math.ceil(input.length / 2));
  for(i = 0; i < dividend.length; i++)
  {
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  }

  /*
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. All remainders are stored for later
   * use.
   */
  var full_length = Math.ceil(input.length * 8 /
                                    (Math.log(encoding.length) / Math.log(2)));
  var remainders = Array(full_length);
  for(j = 0; j < full_length; j++)
  {
    quotient = Array();
    x = 0;
    for(i = 0; i < dividend.length; i++)
    {
      x = (x << 16) + dividend[i];
      q = Math.floor(x / divisor);
      x -= q * divisor;
      if(quotient.length > 0 || q > 0)
        quotient[quotient.length] = q;
    }
    remainders[j] = x;
    dividend = quotient;
  }

  /* Convert the remainders to the output string */
  var output = "";
  for(i = remainders.length - 1; i >= 0; i--)
    output += encoding.charAt(remainders[i]);

  return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input)
{
  var output = "";
  var i = -1;
  var x, y;

  while(++i < input.length)
  {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
    {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i++;
    }

    /* Encode output as utf-8 */
    if(x <= 0x7F)
      output += String.fromCharCode(x);
    else if(x <= 0x7FF)
      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0xFFFF)
      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0x1FFFFF)
      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                    0x80 | ((x >>> 12) & 0x3F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
  }
  return output;
}

/*
 * Encode a string as utf-16
 */
function str2rstr_utf16le(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                  (input.charCodeAt(i) >>> 8) & 0xFF);
  return output;
}

function str2rstr_utf16be(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                   input.charCodeAt(i)        & 0xFF);
  return output;
}

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
    output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
  return output;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
  return output;
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}
;
define("Sha256", (function (global) {
    return function () {
        var ret, fn;
        return ret || global.Sha256;
    };
}(this)));

define( 'uilayer/security/security',["../../core", "../../util/config_pubsub", "Sha256", "../ajax/ajax"], function( uilayer, configPubsub ) {
    
    /**
     * @description UI Layer security module to be executed before every ajax request
     * @module Security
     * @requires core
     * @requires Sha256
     * @require ajax
     * @author shruti, yogeshwar
     * @version 0.1
     */

    /**
     * @description An object hash to maintain information like byPassURL, key
     * and CSRF token to be sent with POST AJAX requests
     * @type {Object}
     * @private
     */
    var config = {},
		checksumKey = null,
		securedURLs = ["services"],
        CHECKSUM_HEADER = "x-chksum-header",
		GET="GET",
		onSecurityThreat,
        regTypes = /GET|POST|DELETE|PUT/i,
		w = window,
		loc = w.location,
		ctxPathname = loc.pathname,
		href = loc.href,
		ctxName = href.substring(0, href.indexOf(ctxPathname.split('/')[2])),
		$div = $("<div>" ),
        bundle = $.extend( true, window.uilayer.messages, {
            "SECURITY_EXCEPTION":"Request can not be completed due to security reasons. Please contact admin for more details.",
			"ACCESS_DENIED_EXCEPTION":"You do not have necessary permissions to perform the action. Please contact admin for more details.",
        });

	/* helper method for checksum calculation */
    function replaceNewLinePostEncoding( allValues ) {
        var tmp = encodeURIComponent( allValues );
        var tmp1 = replaceAll( tmp, "%0D", "" );// carriage return
        tmp1 = replaceAll( tmp1, "%0A", "" );// line feed
        return tmp1;
    }
	
	/* helper method for checksum calculation */
    function replaceAll( txt, replace, withThis ) {
        return txt.replace( new RegExp( replace, "g" ), withThis );
    }

    /**
     * @description This is a before send preprocessor
     * @param xhr jqXHR object of an ajax call
     * @param settings all the settings of an ajax request
     * @returns {boolean} value which decides whether the request should be aborted or continued
     *          - returning false aborts the request
     * @private
     */
    function secureAjax( xhr, settings ) {
		var type = settings.type,
			url = settings.url;
		if ( type.match( regTypes ) ) {
            // check whether checksum should be calculated for URL
			// if bypasse urls are not configured, check for checksum calculations
			// or if bypass urls are there then this "url" is bypassed, if not bypassed calculate checksum
			if( isSecuredURL( settings ) ) {
                var checkSum = generateChecksum( settings );
                //add the token as a custom request header
                xhr.setRequestHeader( CHECKSUM_HEADER, checkSum );
            }

            //get token from the config object
            if( type.toUpperCase() !== GET && config.csrftoken !== "false" )
            {
                //add the token as a custom CSRF request header
                xhr.setRequestHeader( config.csrftokenHeaderName, config.csrftoken );
            }
        }
    }

    /**
     * @description Generates a checksum with the key and the request body
     * @param settings all the settings of an ajax request
     * @returns {String} checksum for the request
     * @private
     */
    function generateChecksum( settings ) {
        //get key from the config object
        var key = checksumKey,
            str = "",
            checkSum;
		if ( !key ) {
			throw new Error("A key should be set using uilayer.config('security', { key: key })");
		}
        if ( typeof settings.data === "undefined" ) {
            str = decodeURIComponent( qualifyURL ( settings.url.replace(/\+/g, "%20") ) )  + key;
        }
        else {
			str = decodeURIComponent( qualifyURL ( settings.url.replace(/\+/g, "%20") ) ) + settings.data + key;
        }
        // new line and carriage return are removed from client side as well as server side
        str = replaceNewLinePostEncoding( str );

        //generate the checksum
        checkSum = Sha256.hash( str, true );
        return checkSum;
    }

    /**
     * @description secureAjax is added as beforeSend processor of uilayer.ajax
     */
    uilayer.config( "ajax", {
        beforeSendProcessors: {
            security: secureAjax
        },
        afterErrorProcessors: {
            "securityViolationHandler": function( xhr, status, statusCode  ) {
                var e = xhr.responseJSON,
                    handled;
                if(xhr.status===403) {
                    if (e) {
                        handled = true;
                        // XSS_SECURITY_VIOLATION_EXCEPTION(10007), CHECKSUMS_NOT_MATCH_EXCEPTION(10008),
                        // CHECKSUM_NOT_FOUND_EXCEPTION(10009), KEY_NOT_FOUND(10010)
                        switch (e.errorName) {
                            case "CHECKSUM_CALCULATION_EXCEPTION":
                            case "CHECKSUMS_NOT_MATCH_EXCEPTION":
                            case "CHECKSUM_NOT_FOUND_EXCEPTION":
                                if (onSecurityThreat) {
                                    onSecurityThreat(e);
                                } else {
                                    uilayer.notifier("error", bundle.SECURITY_EXCEPTION);
                                }
                                break;
                            // XSS_SCAN_EXCEPTION(10004)
                            case "XSS_SCAN_EXCEPTION":
                            case "UNSUPPORTED_ENCODING_EXCEPTION":
                            case "XSS_SECURITY_VIOLATION_EXCEPTION":
                            case "DECODER_INTERNAL_EXCEPTION":
                                uilayer.notifier("error", bundle.SECURITY_EXCEPTION);
                                break;
                            case "ACCESS_DENIED_EXCEPTION":
                                uilayer.notifier("error", bundle.ACCESS_DENIED_EXCEPTION);
                                break;
                            default:
                                uilayer.notifier("error", bundle.http_status_code_403);
                                break;
                        }

                    }
                }else{
                    handled = false;
                }
                xhr.handled = xhr.handled || handled;
            }
        }
    } );

    /**
     * @description An API on uilayer to fetch initial config for security related information
     *  - key, byPassURL array, CSRF token
     * @param callback first request of an application,
     * which is aborted before config information is gathered
     */
    uilayer.fetchConfig = function( callback, options ) {
		var url = ( options && options.url ) ? options.url : "uilayer/config";
        // ajax call
        return uilayer.ajax( {
            url: url,
            success: function( data ) {
                // set up security config object
                // then invoke callback
                config = data;
                callback();
            },
            error: function() {
                alert( "Error in getting the config information!!" );
            }
        } );
    };

	function isSecuredURL ( settings ) {
		var len = securedURLs.length,
			i, url = settings.url,
			securedURL;
		for ( i = 0; i < len; i++ ) {
			securedURL = securedURLs[i];
			if( url.indexOf( securedURL ) !== -1 ) {
				return !isURLbypassed( settings );
			}
		}
		return false;
	}
	
	/**
     * @description Checks whether the request URL is in the byPassURL array
     * @param settings all the settings of an ajax request
     * @returns {boolean}
     * @private
     */
    function isURLbypassed( settings ) {
        var url = settings.url, i, len,
            byPassURL = config.byPassURL;

        if ( byPassURL  ) {
            len = byPassURL.length;
            for(i=0; i<len; i++  ) {
                /* $ : to match complete url in bypassURL array,javascript match function  also returns while it has substring match & which is not expected */
                if ( url.match( new RegExp( byPassURL[i] + "$" ) ) ) {
                    return true;
                }
            }
        }
        return false;
    }

    function qualifyURL( url ) {
		var url;
		$div.html('<a href="' + url + '">' );
		url = $div[0].firstChild.href;
		$div.empty();
		if( loc.protocol.indexOf("file:") !== -1 ) {
			return url.substring( url.indexOf("www") + 4 );
		} else {
			return url.replace(ctxName, "");
		}
    }

	/* accept secured urls and checksum key as configuration at client  */
	/* this should be done after the log in has done */
	configPubsub( "security" ).subscribe( function( config ) { 
		if( config.securedURLs ) {
			securedURLs = config.securedURLs;
		}
		if( config.newSecuredURLs ) {
			$.merge ( securedURLs,  config.newSecuredURLs );
		}
		if( config.key ) {
			checksumKey = config.key;
		}
		if( config.onSecurityThreat ) {
			onSecurityThreat = config.onSecurityThreat;
		}
	} );
} );


/**
 * Created by sonam on 19-04-2016.
 */
define( 'uilayer/ui/notification',["../../core" ], function( uilayer ) {
    var SYSTEM_EXCEPTION = "SYSTEM_EXCEPTION",
        FATAL = "FATAL",
        BUSINESS_EXCEPTION = "BUSINESS_EXCEPTION",
        ERROR = "error",
        WARNING_ICON = "ul-i-warning",
        SUCCESS_ICON = "ul-i-success",
        ERROR_ICON = "ul-i-error",
        INFO_ICON = "ul-i-info",
        WARNING = "warning",
        INFO = "info",
        SUCCESS = "success",
        NOTIFICATION_AT_TOP = "notification-at-top",
        NOTIFICATION_CONTAINER = "eq-notification-container",
        K_BUTTON = "k-button",
        KENDO_ANIMATION_CONTAINER = "k-animation-container",
        K_OVERLAY = "k-overlay",
        CLICK = "click",
        DOWN = "down",
        UP = "up",
        BODY = "body",
        NS = ".eq-notification",
        DETAILS = "eq-error-details",
        SHOW_DETAILS_BTN = "eq-error-show-details-btn",
        REPORT_ISSUE_BTN = "eq-error-report-issue-btn",
        ERROR_BUTTONS = "eq-error-buttons",
        SHOW_DETAILS_HEIGHT = 150,
        FATAL_ERROR="fatal_error",
        ERROR_NOTIFICATION = "eq-error-notification",
        NOTIFIER = "eq-notifier",
        bundle = $.extend( true, window.uilayer.messages, {
            "ShowDetailsLabel": "Show Details",
            "HideDetailsLabel": "Hide Details",
            "ReportIssueLabel": "Report Issue"
        }),
        notificationAtTopTmpl,
        notificationAtBottomTmpl,
        notificationAtTop = null,
        notificationAtBottom = null,
        maxNotifications= 5,
        overlay = null;

    function createNotification() {
        notificationAtTopTmpl = [
            {
                type: FATAL_ERROR,
                template: "<div class=" + ERROR_NOTIFICATION + ">" +
                "<span class=" + ERROR_ICON + "></span>" +
                "<h3>#= data.title #</h3>" +
                "<p>#= data.message #</p>" +
                "<textarea readonly class=" + DETAILS + "></textarea>" +
                "<div class=" + ERROR_BUTTONS + ">" +
                "<button class=\"" + SHOW_DETAILS_BTN + " " + K_BUTTON + "\">" +
                bundle.ShowDetailsLabel + "</button>" +
                "<button class=\"" + REPORT_ISSUE_BTN + " " + K_BUTTON + "\">" +
                bundle.ReportIssueLabel + "</button>" +
                "</div>" +
                "<span class='k-icon k-i-close align-center to-right " +
                "eq-accordion-close-span'></span>" +
                "</div>"
            },
            {
                type: ERROR,
                template: "<div class=" + NOTIFIER + ">" +
                "<span class=" + ERROR_ICON + "></span>" +
                "#if(data.title){#" +
                "<h3>#= data.title #</h3>" +
                "#}#"+
                "<p>#= message #</p>" +
                "<span class='k-icon k-i-close align-center to-right " +
                "eq-accordion-close-span'></span>" +
                "</div>"
            },
            {
                type: WARNING,
                template: "<div class=" + NOTIFIER + ">" +
                "<span class=" + WARNING_ICON + "></span>" +
                "<p>#= message #</p>" +
                "<span class='k-icon k-i-close align-center to-right " +
                "eq-accordion-close-span'></span>" +
                "</div>"
            },
            {
                type: SUCCESS,
                template: "<div class=" + NOTIFIER + ">" +
                "<span class=" + SUCCESS_ICON + "></span>" +
                "<p>#= message #</p>" +
                "<span class='k-icon k-i-close align-center to-right " +
                "eq-accordion-close-span'></span>" +
                "</div>"
            }
        ];
        notificationAtBottomTmpl = [
            {
                type: SUCCESS,
                template: "<div class=" + NOTIFIER + ">" +
                "<span class=" + SUCCESS_ICON + "></span>" +
                "<p>#= message #</p>" +
                "</div>"
            },
            {
                type: INFO,
                template: "<div class=" + NOTIFIER + ">" +
                "<span class=" + INFO_ICON + "></span>" +
                "<p>#= message #</p>" +
                "</div>"
            }
        ];
        notificationAtTop = uilayer.notification( {
            elem: $( "<span></span>" ).appendTo( BODY ),
            position: {
                pinned: true,
                top: 0
            },
            width: $( document.body ).width() * 0.5,
            stacking: DOWN,
            autoHideAfter: 0,
            templates: notificationAtTopTmpl,
            button: true,
            show: function( event ) {
                var element = event.element,
                    notificationObj = event.sender.notificationObj;

                element.closest( "." + KENDO_ANIMATION_CONTAINER ).css( {
                    "right": "0",
                    "left": "0",
                    "bottom": "auto",
                    "margin": "auto",
                    "max-height": "80%",
                    "max-width": "50%",
                    "z-index": "1000001"
                } ).addClass( NOTIFICATION_AT_TOP );
                element.data( "notificationObj", notificationObj );

                if ( notificationObj.type === FATAL_ERROR ) {
                    if ( notificationObj.blocking ) {
                        overlay = $( "<div class=" + K_OVERLAY + "></div>" )
                            .insertBefore( this.options.elem );
                    }
                    handleShowDetails( element );
                    handleReportIssue( element );
                }
                element.find( "textarea" ).height( SHOW_DETAILS_HEIGHT );

                element.on( CLICK + NS, ( "." + NOTIFIER + ", ." + ERROR_NOTIFICATION ), function( e ) {
                    if ( !$( e.target ).is( ".k-i-close" ) ) {
                        e.stopPropagation();
                    }
                } )
            },
            hide: function( event ) {
                var notifyElem = event.element,
                    elementsTobeMoved = notifyElem.closest( "." + KENDO_ANIMATION_CONTAINER )
                        .nextAll( "." + NOTIFICATION_AT_TOP ),
                    notifyElemHeight = notifyElem.height();
                notifyElem.off( CLICK + NS );
                removeOverlay( notifyElem );
                event.sender.notificationObj = null;
                notifyElem.removeData( "notificationObj" );
                notifyElem.find( "textarea" ).height( 0 );
                moveNotifications( elementsTobeMoved, notifyElemHeight, UP );
            }
        } );
        notificationAtBottom = uilayer.notification( {
            elem: $( "<span></span>" ).appendTo( BODY ),
            position: {
                pinned: true,
                right: 10,
                bottom: 10
            },
            show: function( event ) {
                event.element.closest( "." + KENDO_ANIMATION_CONTAINER ).css( {
                    "z-index": "1000001"
                } );
            },
            width: "21em",
            stacking: UP,
            autoHideAfter: 5000,
            templates: notificationAtBottomTmpl
        } );

        $( window ).on( "resize", function() {
            var newWidth = $( document.body ).width() * 0.5;
            notificationAtBottom.hide();
            $.each( notificationAtTop.getNotifications(), function( idx, notificationElem ) {
                $( notificationElem ).parent().width( newWidth );
                $( notificationElem ).width( "100%" );
            } );
            notificationAtTop.widget.options.width = newWidth;
        } );
    }

    /**
     * @description This method shows the notification depending on the type of exception.
     * @param type {String} type of exception. It can be from following types
     * FATAL_ERROR/SUCCESS/ERROR/INFO/WARNING.
     * @param isBlocking {boolean} if overlay is required or not
     * @param notificationObj {object} notification object containing all the information of the notification
     */
    function showNotification( type, isBlocking, notificationObj ) {

        if( type != "info" && type!=="success"){
            notificationAtTop.widget.notificationObj = notificationObj;
        }
        if(isBlocking && type==="success"){
            notificationAtTop.widget.notificationObj = notificationObj;
            notificationAtTop.show( notificationObj, type );
        }
        else {
            switch ( type ) {
                case FATAL_ERROR:
                    notificationAtTop.show( notificationObj, type );
                    break;

                case SUCCESS:
                    notificationAtBottom.success( notificationObj );
                    break;

                case INFO:
                    notificationAtBottom.info( notificationObj );
                    break;

                case WARNING:
                    notificationAtTop.warning( notificationObj );
                    break;

                case ERROR:
                    notificationAtTop.error( notificationObj );
                    break;

                default :
                    break;
            }
        }

    }

    /**
     * @description This method handles show/hide of the details of a system exception.
     * @param errorNotifierElem
     * @private
     */
    function handleShowDetails( errorNotifierElem ) {

        var notificationObj = errorNotifierElem.data( "notificationObj" ),
            showDetailsDiv = errorNotifierElem.find( "." + DETAILS ),
            show = true,
            currentTarget,
            elementsTobeMoved,
            showDetailsDivHeight = SHOW_DETAILS_HEIGHT + 30,
            animationContainer = errorNotifierElem.closest( "." + KENDO_ANIMATION_CONTAINER );

        showDetailsDiv.text( notificationObj.details ).hide();

        errorNotifierElem.on( CLICK + NS,"." + SHOW_DETAILS_BTN , function( event ) {
            event.stopPropagation();
            currentTarget = $( event.currentTarget );
            elementsTobeMoved = currentTarget.
                    closest( "." + KENDO_ANIMATION_CONTAINER ).nextAll( "." + NOTIFICATION_AT_TOP );
            if ( show ) {
                currentTarget.html( bundle.HideDetailsLabel );
                showDetailsDiv.slideDown( function() {
                    animationContainer.height( animationContainer.find( "div:first-child" ).height() );
                } );
                moveNotifications( elementsTobeMoved, showDetailsDivHeight, DOWN );
            }
            else {
                currentTarget.html( bundle.ShowDetailsLabel );
                showDetailsDiv.slideUp( function() {
                    animationContainer.height( animationContainer.find( "div:first-child" ).height() );
                } );
                moveNotifications( elementsTobeMoved, showDetailsDivHeight, UP );
            }
            show = !show;
        } );
    }

    function handleReportIssue( errorNotifierElem ) {
        var notificationObj;
        errorNotifierElem.on( CLICK + NS,  "." + REPORT_ISSUE_BTN ,function() {
            notificationObj = errorNotifierElem.data( "notificationObj" );
            uilayer.reportIssue( notificationObj );
        } );
    }

    /**
     * @description This method removes the overlay
     * which is displayed in severe system exception.
     * @param errorNotifierElem
     * @private
     */
    function removeOverlay( errorNotifierElem ) {
        var notificationObj = errorNotifierElem.data( "notificationObj" );
        if ( notificationObj.blocking && overlay !== null ) {
            overlay.remove();
            overlay = null;
        }
    }

    /**
     * @description This method moves notifications depending on the direction flag sent
     * @param {Array} elementsTobeMoved Array of notification elements that are supposed to be moved
     * @param {number} elementHeight height by which the notifications are supposed to be moved
     * @param {String} direction flag which indicates whether the elements
     * are supposed to be moved up or down
     */
    function moveNotifications( elementsTobeMoved, elementHeight, direction ) {
        var i, top;
        if ( elementsTobeMoved ) {
            if ( direction === UP ) {
                for ( i = 0; i < elementsTobeMoved.length; i += 1 ) {
                    top = $( elementsTobeMoved[i] ).position().top - elementHeight;
                    $( elementsTobeMoved[i] ).addClass( NOTIFICATION_CONTAINER );
                    $( elementsTobeMoved[i] ).css( "top", top );
                }
            }
            else {
                for ( i = 0; i < elementsTobeMoved.length; i += 1 ) {
                    top = $( elementsTobeMoved[i] ).position().top + elementHeight;
                    $( elementsTobeMoved[i] ).css( "top", top );
                }
            }
        }
    }

    function hideIfRequired() {

        if ( notificationAtBottom.getNotifications().length > maxNotifications ) {
            notificationAtBottom.hide();
            return true;
        }
        return false;
    }

    function createAndShowNotification( type, isBlocking, notificationObj ) {
        if ( notificationAtBottom === null || notificationAtTop === null ) {
            require( ["widgets"], function() {
                createNotification();
                showNotification( type, isBlocking, notificationObj );
            } );
            return;
        }

        var hidden = hideIfRequired();
        if ( hidden ) {
            setTimeout( function() {
                showNotification( type, isBlocking, notificationObj );
            }, 700 );
        }
        else {
            showNotification( type, isBlocking, notificationObj );
        }
    }

    /**
     * @description API to show normal notifications - alerts.
     * @param {String} type type of alert. It can be success/error/info/warning.
     * @param {String} message message that will be shown in the notification.
     * @public
     */
    uilayer.notifier = function( type, message, isBlocking ) {
        var notificationObj = {};
        if(typeof message === "string"){
            notificationObj = {};
            notificationObj.message = message;
        }
        else{
            notificationObj = message;
        }
        createAndShowNotification( type, isBlocking , notificationObj );
    };

    uilayer.hideAllNotifications = function() {
        if ( notificationAtTop ) {
            notificationAtTop.hide();
        }
        if ( notificationAtBottom ) {
            notificationAtBottom.hide();
        }
    };

    return{
        maxNotifications:maxNotifications
    }
});


/**
 * Created by sonam on 25-04-2016.
 */


define( 'uilayer/exceptionHandling/logWindow',["../../core"], function( uilayer ) {
    /**
     * Function which creates the notification log window.
     */

    var NOTIFICATION_WIN = "notification-win",
        NOTIFICATION_WIN_CONTENT = "notification-win-content",
        BODY = "body",
        notifyWin = null,
        notifyGrid= null;
        function notifyWinDestroy(e){
            e.sender.destroy();
            notifyWin =  null;
            notifyGrid = null;
        }
    function createErrorLogWindow() {
        var notifyWinTemplate = "<div id =" + NOTIFICATION_WIN + ">" +
            "<div class =" + NOTIFICATION_WIN_CONTENT + "></div></div>";

            notifyWin = uilayer.extWindow( {
                elem: $( notifyWinTemplate ).appendTo( BODY ),
                actions: ["Minimize", "Maximize", "Close"],
                close:notifyWinDestroy,
                animation: false,
                visible: false,
                title: "Error Log",
                width: "50%",
                height: "50%"
            } );

            notifyGrid = uilayer.grid( {
                elem: notifyWin.$el.find( "." + NOTIFICATION_WIN_CONTENT ),
                height: "100%",
                columns: [
                    {
                        field: "title",
                        title: "Exception Type",
                        width: "20%"
                    },
                    {
                        field: "message",
                        title: "Error Message",
                        width: "30%"
                    }
                ]
            } );
    }


    /**
     * @description API to show logger window.
     * @public
     */
    function errorLogWindow(notificationLog) {
        var dataSource = new uilayer.data.DataSource( {
            data: notificationLog
        } );
        if ( notifyWin === null ) {
            require( ["widgets"], function() {
                createErrorLogWindow();
                notifyGrid.setDataSource( dataSource );
                notifyWin.center().open();
                notifyWin.widget.resize();
            } );
            return;
        }
        notifyGrid.setDataSource( dataSource );
        notifyWin.center().open();
        notifyWin.widget.resize();
    }
    return {
        errorLogWindow:errorLogWindow
    }
});
define( 'uilayer/exceptionHandling/notifier',["../../core","./../ui/notification","./logWindow"], function( uilayer, notification,errorLogWindow ) {
    
    /**
     * @module Notification
     * @exports uilayer
     * @requires core
     * @requires widgets
     * @returns ExceptionNotification
     * @author shruti, yogeshwar
     * @version 0.1
     */
    var SYSTEM_EXCEPTION = "SYSTEM_EXCEPTION",
        FATAL = "FATAL",
        BUSINESS_EXCEPTION = "BUSINESS_EXCEPTION",
        ERROR = "error",
        WARNING="warning",
        RETRYABLE_EXCEPTION = "RETRYABLE_SYSTEM_EXCEPTION",
        errObj = null,
        maxNotifications = notification.maxNotifications,
        notificationLog = [],
        bundle = $.extend( true, window.uilayer.messages, {
            "http_status_code_0": "Application could not connect to Server. Please check your Network or Server.",
            "http_status_code_404": "The requested resource could not be found.",
            "http_status_code_419": "Authentication has Timeout!",
            "http_status_code_403": "You do not have necessary permissions for the resource!",
            "unknownError": "Unknown error!",
            "notrace": "Please contact admin for more details.",
            "SystemException": "System Exception",
            "RetryableException": "Retryable Exception",
            "BusinessException": "Business Exception",
            "HttpError": "HTTP Error",
            "timeout": "The request has been timed out. Please try again.",
            "abort": "The request has been aborted.",
            "parsererror": "Error response received is not valid."
        }),
        FATAL_ERROR="fatal_error",
        HTTP_EXCEPTION = "HTTP_ERROR";

    /**
     * @description This method forms the error object which has the
     * title and message to be shown in the error notification.
     * @param {Object} jqXHR jqXHR object of an ajax call.
     * @param {String} textStatus status of the ajax request. "timeout", "error", "abort", and "parsererror"
     * @param {String} errThrown error because of which the ajax request failed.
     */
    var notify = function( jqXHR, textStatus, errThrown, config ) {
        var responseJSON = jqXHR.responseJSON,
            responseText = jqXHR.responseText,
            httpStatusCode = jqXHR.status,
			httpStatusMessage;

        errObj = {};// message abd type of exceptions are only required members of error object
        if(config.maxNotifications) {
            maxNotifications = config.maxNotifications;
        }

        // aborted the request by user or
        // application for internal purposes
        if( textStatus === "abort" ) {
            // do nothing
            return;
        }
        if( !textStatus || textStatus === "error" ) {
            if ( httpStatusCode < 200 || ( httpStatusCode > 300 && httpStatusCode !== 304 && httpStatusCode !== 422 && httpStatusCode < 500 ) ) {
				httpStatusMessage = bundle[ "http_status_code_" + httpStatusCode ];
                // message abd type of exceptions are only required members of error object
                $.extend( errObj, {
                    message: httpStatusMessage || ( httpStatusCode + " " + errThrown ),
                    clazz: HTTP_EXCEPTION
                });
            } else {
                // json in response is expected for sure
                if( !responseJSON ) {
                    // if not json in response it's serious fault in server flow
                    responseJSON = toJson( responseText );
                }
                if( responseJSON ) {
                    var defered;
                    // get message from application, if configured
                    if ( config.hasOwnProperty( "resolveMessage" ) ) {
                        defered = config.resolveMessage( responseJSON );
                        if( defered ) {
                            if ( typeof defered === "string" ) {
                                errObj.message = defered;
                            }
                            else if ( defered.done ) {
                                defered.done( function( message ) {
                                    if( message ) {
                                        errObj.message = message;
                                    }
                                    notifier();
                                } );
                                defered.fail( function() {
                                    console.log("Failed to load application message resolver.");
                                    notifier();
                                });
                                return "resolving";
                            }
                            // else default message in responseJSON is used
                        }
                    }
                    // else default message in responseJSON is used
                }
                // for errors stack trace must be there
                $.extend( errObj, responseJSON, {
                    reportIssue : config.reportIssueHandler
                } );
            }
        } else {
            $.extend(errObj, {
                message: bundle[ textStatus ],
                clazz: ERROR
            });
            //TODO Remove these logs.
            console.log( "\n ============== Failed request ============================== \n" );
            console.log( "Failed to process response. See response text below. Status :" + textStatus );
            console.log( responseText );
        }
        $.extend(errObj, {
            message: errObj.message || bundle ["unknownError"],
            clazz: errObj.clazz || SYSTEM_EXCEPTION,
            stackTrace: errObj.stackTrace || responseText
        });
        notifier();
    };

    function toJson ( responseText ) {
        var responseJSON;
        try {
            // response is fine but not converted to JSON as dataType:not-application-json
            // try once to convert
            responseJSON = JSON.parse( responseText );
            responseJSON.isForced = true;
        } catch(e) {
            //TODO handle failure to load bundle
            console.log( "\n ============== Failed request ============================== \n" );
            console.log( "Exception JSON not recieved in response. See response text below." );
            console.log( responseText );
        }
        return responseJSON;
    }

    function notifier(){
        converter();
        uilayer.notifier(errObj.type,errObj);
        notificationLog.push( errObj );
    }

    function converter(){
        if ( errObj.stackTrace === "notrace" ) {
            errObj.stackTrace = bundle["notrace"];
        }
        var type=errObj.clazz;
        switch ( errObj.clazz ) {
            case SYSTEM_EXCEPTION:
                errObj.title = bundle.SystemException;
                type = FATAL_ERROR;
                break;

            case BUSINESS_EXCEPTION:
                errObj.title = bundle.BusinessException;
                type = WARNING;
                break;

            case RETRYABLE_EXCEPTION:
                errObj.title = bundle.RetryableException;
                type = ERROR;
                break;

            case HTTP_EXCEPTION:
                errObj.title = bundle.HttpError;
                type = ERROR;
                break;
        }
        errObj.type = type;
        errObj.details = errObj.stackTrace;
        errObj.blocking = errObj.severity === FATAL ? true : false;
    }

    uilayer.errorLogWindow = function(){
        errorLogWindow.errorLogWindow(notificationLog);
    };

    return {
        notify: notify
    };
} );

define( 'uilayer/exceptionHandling/handler',["../../core", "./notifier", "../../util/config_pubsub", "../ajax/ajax"],
    function( uilayer, notifier, configPubSub ) {
        
        /**
         * @description UILayer exception handler module
         * to be executed after whenever an ajax request fails.
         * @module Exception handler
         * @requires core
         * @requires exceptionNotification
         * @requires uilayer.ajax
         * @author shruti, yogeshwar
         * @version 0.1
         */

        var statusHandlers = {},
            exceptionConfig = {},

            /**
             * @description This is an after error processor which handles the exception,
             * if it is not handled by the developer.
             * @param {Object} xhr jqXHR object of an ajax call.
             * @param {String} textStatus status of the ajax request.
             * @param {String} errorThrown error because of which the ajax request failed.
             * @private
             */
            handler = function( xhr, textStatus, errorThrown ) {
                if ( xhr.handled || statusHandlers.hasOwnProperty( xhr.status ) ) {
                    return;
                }
                notifier.notify( xhr, textStatus, errorThrown, exceptionConfig );
            },

            addStatusHandlers = function( xhr, settings ) {
                var statusHandlersObj;
                /*if ( settings.statusCode ) {*/
                statusHandlersObj = jQuery.extend( {}, statusHandlers, settings.statusCode );
                settings.statusCode = statusHandlersObj;
                //}
                /* else {
                 settings.statusCode = statusHandlers;
                 }*/
            };

        configPubSub( "exceptionHandling" ).subscribe( function( config ) {
            if ( $.isPlainObject( config.statusCode ) ) {
                statusHandlers = config.statusCode;
            }

            if ( $.isFunction( config.reportIssueHandler ) ||
                $.isFunction( config.resolveMessage ) || config.maxNotifications ) {
                exceptionConfig = config;
            }
        } );

        /**
         * @description exception handler is added as after error processor of uilayer.ajax.
         */
        uilayer.config( "ajax", {
            afterErrorProcessors: {
                exceptionHandling: handler
            },
            beforeSendProcessors: {
                statusHandlers: addStatusHandlers
            }
        } );
    } );

define( 'uilayer/validator/validateInputs',[ "../../core" ], function( uilayer ) {
    
    var INPUTSELECTOR = ":input:not(:button,[type=submit],[type=reset],[disabled],[readonly],[novalidate])",
		BLACKCHARs = uilayer.BLACKCHARs = /[<>]/g,
		$el,
		isValidTextValue,
		messages = $.extend( true, window.uilayer.messages, {
			"InvalidInput": "Angle brackets are restricted in inputs.",
			"NAInvalidInputInput": "Non-string type value could not be validated."
		});
	function validator () {
		var val = $( this ).val();
        if ( !(isValidTextValue( val ).status) ) {
			$el = $( this ).focus().select().addClass("k-state-error");
            uilayer.notifier( "error", messages.InvalidInput );
			return false;
        }
		$( this ).removeClass("k-state-error");
		return true;
	}
    /*$( document ).on( "change", INPUTSELECTOR, function( e ) {
        validator.apply(this);
    } );*/

	uilayer.isValidUserInput = function ( el ) {
		$(el).find( INPUTSELECTOR ).each(function() {
			return validator.apply( this );
		});
	};
	
	function isValidTextValue( val ) {
		if ( typeof val !== "string" ) {
			return {
				status:	false,
				regex: BLACKCHARs,
				message: messages.NAInvalidInputInput
			};
		}
		return {
			status:	( val.match( BLACKCHARs ) === null ),
			regex: BLACKCHARs,
			message: messages.InvalidInput
		}
	};
						
	uilayer.isValidTextValue = isValidTextValue;
	
	return uilayer;
} );

define( 'util/extBackbone',["backbone", "../core", "../uilayer/ajax/ajax"], function( Backbone, uilayer, ajax ) {
    
    //Backbone.ajax = function() {
    //    return ajax.apply( uilayer, arguments );
    //};

    /*
     * Enabling reset model API to reset model to previous state.
     * The previous state will be last "sync" state. If model is not
     * synced previously then, model resets to the state when first
     * 'enableReset' is called.
     */
    _.extend( Backbone.Model.prototype, {

        _previousModel: null,

        // silently first clears the model so that dynamically added model props be eliminated
        // then set the previous state on the model. It causes to fire 'change' on model.
        reset: function() {
            this.clear( {"silent": true} ).set( this._previousModel );
            // additional reset event is triggered for developers
            this.trigger( "reset", this );
        },

        //This API should be called in the initialize of the model,
        // if developer wants to use the RESET functionality
        enableReset: function() {
            // adds sync listners to back up last synced state
            this.on( "sync", function( model, resp, options ) {
                if ( model ) {
                    this._previousModel = model.toJSON();
                }
            }, this );

            // on first invokation of this API back up current state
            if ( this._previousModel === null ) {
                this._previousModel = this.toJSON();
            }
        },

        clean: function () {
            this.stopListening();
            this.off();
            this.collection = null;
            this.attributes = null;
            this._relations = null;
        }
    } );

    _.extend( Backbone.Collection.prototype, {

        _previousCollection: null,

        // silently first clears the model so that dynamically added model props be eliminated
        // then set the previous state on the model. It causes to fire 'change' on model.
        resetCollection: function() {
            this.reset( this._previousCollection , { silent: true });
            // additional reeset event is triggered for developers
            this.trigger( 'reset', this );
        },

        keepState: function() {
            this._previousCollection = this.toJSON();
        },

        //This API should be called in the initialize of the model, if developer wants to use the RESET functionality
        enableReset: function() {
            // adds sync listners to back up last synced state
            this.on( 'sync', function( collection, resp, options ) {
                if ( collection ) {
                    this._previousCollection = collection.toJSON();
                }
            }, this );

            // on first invokation of this API back up current state
            if ( this._previousCollection == null ) {
                this._previousCollection = this.toJSON();
            }
        },

        clean: function () {
            for (var i = this.length - 1; i >= 0; i--) {
                this.at(i).clean();
            }
            this.stopListening();
            this.off();
            this.length = 0;
            this.models = null;
            this._byId = null;
        }
    } );

    _.extend( Backbone.RelationalModel.prototype, {
        clean: function () {
            var relations = this.getRelations();
            var relation, relatedModel;
            for (var i = 0, len = relations.length; i < len; i++) {
                relation = relations[i];
                relatedModel = relation.related;
                if (relatedModel && !( relation.options.isAutoRelation )) {
                    relatedModel.clean();
                    Backbone.Relation.prototype.destroy.apply(relation);
                }
            }
            Backbone.Relational.store.unregister(this);
            Backbone.Model.prototype.clean.apply( this );
        }
    } );
} );
/**
 * Created by sonam on 07-10-2015.
 */
define( 'util/parseCustomFormats',["jquery", "../core"], function( $, uilayer ) {
    

    var numberRegExp = {
        2: /^\d{1,2}/,
        3: /^\d{1,3}/,
        4: /^\d{4}/
    },
        zeros = ["", "0", "00", "000", "0000"];

    function lowerArray(data) {
        var idx = 0,
            length = data.length,
            array = [];

        for (; idx < length; idx++) {
            array[idx] = (data[idx] + "").toLowerCase();
        }

        return array;
    }

    function lowerLocalInfo(localInfo) {
        var newLocalInfo = {}, property;

        for (property in localInfo) {
            newLocalInfo[property] = lowerArray(localInfo[property]);
        }

        return newLocalInfo;
    }
    function lowerLocalInfo(localInfo) {
        var newLocalInfo = {}, property;

        for (property in localInfo) {
            newLocalInfo[property] = lowerArray(localInfo[property]);
        }

        return newLocalInfo;
    }

    function pad(number, digits, end){
        number = number + "";
        digits = digits || 2;
        end = digits - number.length;

        if (end) {
            return zeros[digits].substring(0, end) + number;
        }

        return number;
    }

    uilayer.parseCustomFormats = function( value, format, culture ) {
        var val,
            objectToString = {}.toString;
        format = format || "";
        if (!value) {
            return null;
        } else if (objectToString.call(value) === "[object Date]") {
            return value;
        } else if( typeof value === "string" && (value.match(/z$/i) || format.match(/z$/i)) ) {
            val = new Date( value );
            if( !isNaN(val.getTime()) ) {
                return val;
            }
        }
        format = format.replace( /'.*'|SSS|SS|S|EEEE|EEE|EE|E|a|Z{1,}/g, function( match, p1 ) {
            var result;
            if( match.indexOf("'") !== -1 ) {
                result = match;
            }
            else if ( match === "SSS" ) {
                result = "fff";
            }
            else if ( match === "SS" ) {
                result = "ff";
            }
            else if ( match === "S" ) {
                result = "f";
            }
            else if ( match === "a" ) {
                result = "tt";
            }
            else if ( match === "EEEE" ) {
                result = "dddd";
            }
            else if ( match.indexOf("Z") !== -1 ) {
                result = "zzz";
            }
            else if ( match === "E" || match === "EE" || match === "EEE" ) {
                result = "ddd";
            }
            return result !== undefined ? result : match.slice( 0 );
        } );
        var val;// = uilayer.parseDate.call( this, value, format, culture );
       // if ( !val  ) {
            var lookAhead = function( match, evaluate ) {
                    var i = 0;
                    while ( format[idx] === match ) {
                        i++;
                        idx++;
                        if( evaluate === false ) {
                            newfmt += match;
                        }
                    }
                    if ( i > 0 ) {
                        idx -= 1;
                    }
                    return i;
                },
                getNumber = function( size ) {
                    var rg = numberRegExp[size] || new RegExp( '^\\d{1,' + size + '}' ),
                        match = value.substr( valueIdx, size ).match( rg );

                    if ( match ) {
                        match = match[0];
                        valueIdx += match.length;
                        return parseInt( match, 10 );
                    }
                    return null;
                },
                getIndexByName = function (names, lower) {
                    var i = 0,
                        length = names.length,
                        name, nameLength,
                        subValue;

                    for (; i < length; i++) {
                        name = names[i];
                        nameLength = name.length;
                        subValue = value.substr(valueIdx, nameLength);

                        if (lower) {
                            subValue = subValue.toLowerCase();
                        }

                        if (subValue == name) {
                            valueIdx += nameLength;
                            return i + 1;
                        }
                    }
                    return null;
                },
                checkLiteral = function() {
                    var result = false;
                    if ( value.charAt( valueIdx ) === format[idx] ) {
                        newfmt += ch;
                        valueIdx++;
                        result = true;
                    }
                    return result;
                },

                outOfRange = function( value, start, end ) {
                    return !(value >= start && value <= end);
                },

                literal = false,
                ch,
                idx = 0,
                valueIdx = 0,
                regExForMonthStart = /Q\[([^\]]+)\]/,
                monthStart = 0,
                isWeekOfTheYear,
                year = null,
                month = null,
                day = null,
                week = null,
                culture = kendo.getCulture( culture ),
                calendar = culture.calendars.standard,
                weekStart=culture.calendar.firstDay,
                count,
                date = new Date(),
                twoDigitYearMax = calendar.twoDigitYearMax || 2029,
                defaultYear = date.getFullYear(),
                quarterRegEx = /Q(\d+)/,
                formatArr,
                monthStart = 0,
                quarterNo,
                quarterMatch,
                length;
            formatArr = format.split( "" );
            length = formatArr.length;

            var newfmt = "";
            for ( ; idx < length; idx++ ) {
                ch = formatArr[idx];
                if ( literal ) {
                    if ( ch === "'" ) {
                        literal = false;
                        newfmt += ch;
                    }
                    else {
                        checkLiteral();
                    }
                }
                else {
                    if ( ch === "Q" ) {
                        valueIdx = idx + 2;
                        var monthStartExecResult = regExForMonthStart.exec( format );
                        if ( monthStartExecResult ) {
                            monthStart = parseInt( monthStartExecResult[1] );
                            idx = idx + 2 + monthStart.toString().length;
                        }
                        quarterMatch = quarterRegEx.exec( value );

                        if ( !quarterMatch ){ /* true if invalid value for the format */
                            return null;
                        }

                            quarterNo = quarterMatch[1] % 4 || 4;
                            month = (monthStart + (quarterNo - 1 ) * 3);
                            newfmt = newfmt + "'" + quarterMatch[0] + "'";
                    }
                    else if ( ch === "w" ) {
                        count = lookAhead( "w" );
                        isWeekOfTheYear = true;
                        count = count>1 ? count : 2;
                        week = getNumber( count  );
                        if( week === null || outOfRange(week, 1, 53) )
                            return null;

                        day = 1 + ((week -1) * 7);
                        newfmt = newfmt + "'" + pad(week,count) + "'";
                    }
                    else if( ch === "W"){
                        count = lookAhead( "W" );
                        week = getNumber( count );
                        if( week === null || outOfRange(week, 1, 5) )
                            return null;

                        day = (1 + (week -1) * 7);
                        newfmt = newfmt + "'" + pad(week,count) + "'";
                    }
                    else if ( ch === "'" ) {
                        literal = true;
                        checkLiteral();
                        newfmt += ch;
                    }
					else if (ch === "d") {
                            count = lookAhead("d", false);
                            if (!calendar._lowerDays) {
                                calendar._lowerDays = lowerLocalInfo(calendar.days);
                            }
                            count < 3 ? getNumber(2) : getIndexByName(calendar._lowerDays[count == 3 ? "namesAbbr" : "names"], true);
                    } else if (ch === "M") {
                            count = lookAhead("M", false);
                            if (!calendar._lowerMonths) {
                                calendar._lowerMonths = lowerLocalInfo(calendar.months);
                            }
                            count < 3 ? getNumber(2) : getIndexByName(calendar._lowerMonths[count == 3 ? 'namesAbbr' : 'names'], true);
                    }
                    else if ( !checkLiteral() ) {
                        newfmt += ch;
                        valueIdx++;
                    }
                }
            }
            val = uilayer.parseDate.call( this, value, newfmt, culture );
            if( val ) {
                if( month ) {
                    val.setMonth( month );
                } else if( day) { 
					var newDate = day - (val.getDay() - weekStart );
                    if(isWeekOfTheYear) {
                        val.setMonth( 0 );
                    }
					if(newDate>0){
						val.setDate( newDate );
					}

                }
            }
       // }
        return val;
    }
} );
/**
 * @file A module that specifies dependency on core of uilayer and all other
 * features the uilayer is supporting. All the features will be available
 * on uilayer module object.
 */
define('uilayer',[
    "./core",
    "./uilayer/ajax/ajax",
	"./uilayer/ui/confirmbox",
	"./uilayer/databinding/databinding",
	"./uilayer/security/security",
    "./uilayer/exceptionHandling/handler",
    "./uilayer/validator/validateInputs",
	"./util/extBackbone",
    "./util/parseCustomFormats"
], function (uilayer) {
    
	
    return uilayer;
});
