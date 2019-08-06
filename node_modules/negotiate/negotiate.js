/**
 * Negotiate.js
 * 
 * @fileOverview HTTP Content Negotiation in JavaScript
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @version 1.0
 * @see http://github.com/garycourt/negotiate-js
 */

/*
 * Copyright 2010 Gary Court. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY GARY COURT ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL GARY COURT OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*jslint white: true, onevar: true, undef: true, eqeqeq: true, newcap: true, immed: true, sub: true */

var exports = exports || this,
	require = require || function () {
		return exports;
	};

(function () {
	
	var O = {};
	
	function typeOf(o) {
		return o === undefined ? 'undefined' : (o === null ? 'null' : Object.prototype.toString.call(o).split(' ').pop().split(']').shift().toLowerCase());
	}
	
	function isNumeric(o) {
		return typeof o === "number" || (typeof o === "string" && /^\s*-?(0x)?\d+(.\d+)?\s*$/.test(o));
	}
	
	function F() {}
	function delegateObject(obj) {
		F.prototype = obj;
		return new F();
	}
	
	function toArray(o) {
		return o !== undefined && o !== null ? (o instanceof Array && !o.callee ? o : (typeof o.length !== 'number' || o.split || o.setInterval || o.call ? [ o ] : Array.prototype.slice.call(o))) : [];
	}
	
	function clone(obj, deep) {
		var newObj, x;
		
		switch (typeOf(obj)) {
		case 'undefined':
			return;
		case 'null':
			return null;
		case 'boolean':
			return !!obj;
		case 'number':
			return +obj;
		case 'string':
			return '' + obj;
		case 'object':
			if (deep) {
				newObj = {};
				for (x in obj) {
					if (obj[x] !== O[x]) {
						newObj[x] = clone(obj[x], deep);
					}
				}
				return newObj;
			} else {
				return delegateObject(obj);
			}
			break;
		case 'array':
			if (deep) {
				newObj = new Array(obj.length);
				x = obj.length;
				while (--x >= 0) {
					newObj[x] = clone(obj[x], deep);
				}
				return newObj;
			} else {
				return Array.prototype.slice.call(obj);
			}
			break;
		case 'function':
			newObj = function () {
				return obj.apply(this, arguments);
			};
			F.prototype = undefined;
			for (x in obj) {
				if (obj[x] !== F[x]) {
					newObj[x] = clone(obj[x], deep);
				}
			}
			return newObj;
		case 'regexp':
			return new RegExp(obj);
		case 'date':
			return new Date(obj);
		}
	}
	
	function uc(str, deflt) {
		return (str || deflt || '').toUpperCase();
	}
	
	function lc(str, deflt) {
		return (str || deflt || '').toLowerCase();
	}
	
	function toNative(str) {
		var lcstr = lc(str);
		
		if (lcstr === '') {
			return;
		} else if (lcstr === 'null') {
			return null;
		} else if (lcstr === 'false') {
			return false;
		} else if (lcstr === 'true') {
			return true;
		} else if (/^(\d+)$/.test(str)) {
			return parseInt(str, 10);
		} else if (/^(\d*\.\d+)$/.test(str)) {
			return parseFloat(str, 10);
		}
		
		return str;
	}
	
	function parseHeaderElements(headerValue) {
		var result = [], elements, x, xl, element, y, yl, param;
		
		headerValue = lc(headerValue);  //convert to lowercase
		headerValue = headerValue.replace(/\s/g, '');  //remove spaces
		
		if (headerValue) {
			elements = headerValue.split(',');  //split by commas
			
			for (x = 0, xl = elements.length; x < xl; ++x) {
				element = elements[x].split(';');
				result[x] = [element[0], {}];
				for (y = 1, yl = element.length; y < yl; ++y) {
					param = element[y].split('=');
					if (param.length === 2) {
						result[x][1][param[0]] = toNative(param[1]);
					}
				}
			}
		}
		
		return result;
	}
	
	function precision(num, val) {
		return parseFloat(num.toPrecision(val), 10);
	}
	
	/**
	 * @name Negotiate.choose
	 * @param {Array} variants An array of variant objects
	 * @param {Object} request The request object, which is Node.js HTTP API compatible.
	 * @returns {Array} A deep clone of the variants array, ordered by suitability.
	 *   A new property "q" is added to each variant to indicate it's quality score.
	 *   A score of 0 means the variant is unacceptable for the request.
	 */
	
	function choose(variants, request) {
		var y, yl, x, xl, headers, variant, accepts, variantValue, requestValue, params, q, match;
		
		variants = clone(variants, false);
		headers = {
			method : uc(request['method'], 'GET'),
			acceptType : parseHeaderElements(request.headers['accept']),
			acceptLanguage : parseHeaderElements(request.headers['accept-language']),
			acceptCharset : parseHeaderElements(request.headers['accept-charset']),
			acceptEncoding : parseHeaderElements(request.headers['accept-encoding'])
		};
		
		for (y = 0, yl = variants.length; y < yl; ++y) {
			variant = variants[y];
			
			//quality of request method
			variantValue = uc(variant['method']);
			if (!variantValue || variantValue === headers.method) {
				variant.qm = 1.0;
			} else if (headers.method === 'HEAD' && variantValue === 'GET') {
				variant.qm = 0.5;
			} else {
				variant.qm = 0.0;
			}
			
			//quality of media type
			variant.qt = 0.0;
			variant.qts = 0;
			accepts = headers.acceptType;
			variantValue = lc(variant['type']);
			if (accepts.length) {
				for (x = 0, xl = accepts.length; x < xl; ++x) {
					match = 0;
					requestValue = accepts[x][0];
					params = accepts[x][1];
					
					if (requestValue === '*') {
						match = 1;
					} else if (requestValue === '*/*') {
						match = 2;
					} else if (requestValue === variantValue) {
						match = 4;
					} else if (/^(.+\/)\*$/.test(requestValue) && variantValue.indexOf(RegExp.$1) === 0) {
						match = 3;
					}
					
					if (match > variant.qts && !(typeof variant['length'] === 'number' && typeof params === 'object' && isNumeric(params.mxb) && parseFloat(params.mxb, 10) < variant['length'])) {
						variant.qt = (typeof params === 'object' && isNumeric(params.q) ? parseFloat(params.q, 10) : 1.0);
						variant.qts = match;
					}
				}
			} else {
				variant.qt = 1.0;
			}
			
			//quality of language
			variant.ql = 0.001;  //never disqualify solely on language
			variant.qls = 0;
			accepts = headers.acceptLanguage;
			variantValue = lc(variant['language']);
			if (accepts.length) {
				for (x = 0, xl = accepts.length; x < xl; ++x) {
					match = 0;
					requestValue = accepts[x][0];
					params = accepts[x][1];
					
					if (requestValue === '*') {
						match = 1;
					} else if (requestValue === variantValue) {
						match = 4;
					} else if (/^([a-z]+)\-[a-z]+$/.test(requestValue) && variantValue === RegExp.$1) {
						match = 2;
					} else if (/^([a-z]+)\-[a-z]+$/.test(variantValue) && requestValue === RegExp.$1) {
						match = 3;
					}
					
					if (match > variant.qls) {
						variant.ql = (typeof params === 'object' && isNumeric(params.q) ? parseFloat(params.q, 10) : 1.0);
						variant.qls = match;
					}
				}
				
				if (!variant.qls && !variantValue) {
					variant.ql = 0.5;
				}
			} else {
				variant.ql = 1.0;
			}
			
			//quality of charset
			variant.qc = 0.0;
			variant.qcs = 0;
			accepts = headers.acceptCharset;
			variantValue = lc(variant['charset']);
			if (accepts.length) {
				for (x = 0, xl = accepts.length; x < xl; ++x) {
					match = 0;
					requestValue = accepts[x][0];
					params = accepts[x][1];
					
					if (requestValue === '*') {
						match = 1;
					} else if (requestValue === variantValue) {
						match = 2;
					}
					
					if (match > variant.qcs) {
						variant.qc = (typeof params === 'object' && isNumeric(params.q) ? parseFloat(params.q, 10) : 1.0);
						variant.qcs = match;
					}
				}
				
				if (!variant.qcs && !variantValue) {
					variant.qc = 1.0;
				}
			} else {
				variant.qc = 1.0;
			}
			
			//quality of encoding
			variant.qe = 0.0;
			variant.qes = 0;
			accepts = headers.acceptEncoding;
			variantValue = lc(variant['encoding']);
			if (accepts.length) {
				for (x = 0, xl = accepts.length; x < xl; ++x) {
					match = 0;
					requestValue = accepts[x][0];
					params = accepts[x][1];
					
					if (requestValue === '*') {
						match = 1;
					} else if (requestValue === 'identity' && !variantValue) {
						match = 2;
					} else if (requestValue === variantValue) {
						match = 3;
					}
					
					if (match > variant.qes) {
						variant.qe = (typeof params === 'object' && isNumeric(params.q) ? parseFloat(params.q, 10) : 1.0);
						variant.qes = match;
					}
				}
				
				if (!variant.qes && (!variantValue || variantValue === 'identity')) {
					variant.qe = 1.0;
				}
			} else {
				variant.qe = 1.0;
			}
			
			//quality of source
			variant.qs = typeof variant['quality'] === 'number' ? variant['quality'] : 1.0;
			
			//total quality score
			variant.q = precision(variant.qm * variant.qt * variant.ql * variant.qc * variant.qe * variant.qs, 3);
		}
		
		variants.sort(function (a, b) {
			return precision(b.q - a.q, 3) || (a['length'] && b['length'] ? a['length'] - b['length'] : 0);
		});
		
		return variants;
	}
	
	this.Negotiate = {
		choose : choose
	};
	
	exports.choose = choose;
	
}());
