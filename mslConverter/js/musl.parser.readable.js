/*
    http://www.JSON.org/json2.js
    2009-09-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    this.JSON = {};
}

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    // define some global variables, cx and escapable are regex patterns

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

// the calling "stringify" function sets rep to be a function, if stringify() was called with such a function

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

// stringify() is called with a number or a string, which it assigned to the "indent" variable if it was a number, then "indent" is a string of spaces.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

// ----------------------------------------------------------------------
// Auto-generated by schema_gen.rb - DON'T EDIT THIS FILE
// ----------------------------------------------------------------------
var musl = musl || {};
musl.Schema = {
    scenario: {
        scenario: {
            attributes: {
                name: {
                    name: "name",
                    type: "string",
                    initial: "scenario"
                }
            }
        }
    },
    host: {
        host: {
            attributes: {
                role: {
                    name: "role",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                type: {
                    name: "type",
                    element: true,
                    type: "enum",
                    values: ["v4","v6","l2"]
                }
            }
        },
    },
    field: {
        alternates: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                valid: {
                    name: "valid",
                    element: true,
                    type: "field",
                    required: true
                },
                alternates: {
                    name: "alternates",
                    element: true,
                    type: "array",
                    of: "field"
                }
            }
        },
        array: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                elements: {
                    name: "elements",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                }
            }
        },
        asn1_application_constructed: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                indefinite_length: {
                    name: "indefinite_length",
                    element: true,
                    type: "boolean",
                    initial: false
                },
                contents: {
                    name: "contents",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                },
                tag: {
                    name: "tag",
                    element: true,
                    type: "integer",
                    required: true
                }
            }
        },
        asn1_application_primitive: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                tag: {
                    name: "tag",
                    element: true,
                    type: "integer",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_bit_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                unused_bits: {
                    name: "unused_bits",
                    element: true,
                    type: "integer",
                    initial: 0
                }
            }
        },
        asn1_bmp_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_boolean: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        asn1_character_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_context_specific_constructed: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                indefinite_length: {
                    name: "indefinite_length",
                    element: true,
                    type: "boolean",
                    initial: false
                },
                contents: {
                    name: "contents",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                },
                tag: {
                    name: "tag",
                    element: true,
                    type: "integer",
                    required: true
                }
            }
        },
        asn1_context_specific_primitive: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                tag: {
                    name: "tag",
                    element: true,
                    type: "integer",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_enumerated: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        asn1_general_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_generalized_time: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_graphic_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_ia5_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_integer: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        asn1_null: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                }
            }
        },
        asn1_numeric_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_object_descriptor: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_object_identifier: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        asn1_octet_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_printable_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_private_constructed: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                indefinite_length: {
                    name: "indefinite_length",
                    element: true,
                    type: "boolean",
                    initial: false
                },
                contents: {
                    name: "contents",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                },
                tag: {
                    name: "tag",
                    element: true,
                    type: "integer",
                    required: true
                }
            }
        },
        asn1_private_primitive: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                tag: {
                    name: "tag",
                    element: true,
                    type: "integer",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_relative_object_identifier: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        asn1_sequence: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                indefinite_length: {
                    name: "indefinite_length",
                    element: true,
                    type: "boolean",
                    initial: false
                },
                contents: {
                    name: "contents",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                }
            }
        },
        asn1_set: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                indefinite_length: {
                    name: "indefinite_length",
                    element: true,
                    type: "boolean",
                    initial: false
                },
                contents: {
                    name: "contents",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                }
            }
        },
        asn1_t61_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_universal_constructed: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                indefinite_length: {
                    name: "indefinite_length",
                    element: true,
                    type: "boolean",
                    initial: false
                },
                contents: {
                    name: "contents",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                },
                tag: {
                    name: "tag",
                    element: true,
                    type: "integer",
                    required: true
                }
            }
        },
        asn1_universal_primitive: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                tag: {
                    name: "tag",
                    element: true,
                    type: "integer",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_universal_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_utc_time: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_utf8_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_videotex_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        asn1_visible_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        base64_encode: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                line_terminator: {
                    name: "line_terminator",
                    element: true,
                    type: "string",
                    initial: "\r\n"
                }
            }
        },
        binary: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                encoding: {
                    name: "encoding",
                    element: true,
                    type: "enum",
                    values: ["raw","hex","binary"]
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        c_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        command: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                send: {
                    name: "send",
                    element: true,
                    type: "value",
                    required: true
                },
                expect: {
                    name: "expect",
                    element: true,
                    type: "value"
                },
                timeout: {
                    name: "timeout",
                    element: true,
                    type: "integer",
                    initial: -1
                }
            }
        },
        count_uint: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                width: {
                    name: "width",
                    element: true,
                    type: "integer",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                },
                delta: {
                    name: "delta",
                    element: true,
                    type: "integer",
                    initial: 0
                }
            }
        },
        crc16_checksum: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                after: {
                    name: "after",
                    element: true,
                    type: "reference"
                }
            }
        },
        diameter_avp: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                code: {
                    name: "code",
                    element: true,
                    type: "integer",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                flags: {
                    name: "flags",
                    element: true,
                    type: "integer",
                    initial: 64
                },
                vendor_id: {
                    name: "vendor_id",
                    element: true,
                    type: "integer",
                    initial: 0
                }
            }
        },
        dnp3_length: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                }
            }
        },
        dns_domain_name: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        dsv: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                delimiter: {
                    name: "delimiter",
                    element: true,
                    type: "string",
                    required: true
                },
                elements: {
                    name: "elements",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                }
            }
        },
        email: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                username: {
                    name: "username",
                    element: true,
                    type: "value",
                    required: true
                },
                domain: {
                    name: "domain",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        empty: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                }
            }
        },
        fddi_crc: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                }
            }
        },
        fletcher_osi_checksum: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                }
            }
        },
        float32: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        ftp_ip_port: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                ip: {
                    name: "ip",
                    element: true,
                    type: "value",
                    required: true
                },
                port: {
                    name: "port",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        gtpv0_tid: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                mcc: {
                    name: "mcc",
                    element: true,
                    type: "value",
                    required: true
                },
                mnc: {
                    name: "mnc",
                    element: true,
                    type: "value",
                    required: true
                },
                msin: {
                    name: "msin",
                    element: true,
                    type: "value",
                    required: true
                },
                nsapi: {
                    name: "nsapi",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        gtpv2_ie: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                type: {
                    name: "type",
                    element: true,
                    type: "integer",
                    required: true
                },
                instance: {
                    name: "instance",
                    element: true,
                    type: "integer"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        gzip_compress: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        header: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                header_name: {
                    name: "header_name",
                    element: true,
                    type: "value",
                    required: true
                },
                delimiter: {
                    name: "delimiter",
                    element: true,
                    type: "string",
                    initial: ": "
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                terminator: {
                    name: "terminator",
                    element: true,
                    type: "string",
                    initial: "\r\n"
                }
            }
        },
        hex_encode: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        hostname: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        http_chunk_encode: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                chunk_size: {
                    name: "chunk_size",
                    element: true,
                    type: "value"
                }
            }
        },
        http_digest: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                nonce: {
                    name: "nonce",
                    element: true,
                    type: "value",
                    required: true
                },
                qop: {
                    name: "qop",
                    element: true,
                    type: "value"
                },
                username: {
                    name: "username",
                    element: true,
                    type: "value",
                    required: true
                },
                password: {
                    name: "password",
                    element: true,
                    type: "value",
                    required: true
                },
                algorithm: {
                    name: "algorithm",
                    element: true,
                    type: "value"
                },
                realm: {
                    name: "realm",
                    element: true,
                    type: "value",
                    required: true
                },
                method: {
                    name: "method",
                    element: true,
                    type: "string",
                    required: true
                },
                uri: {
                    name: "uri",
                    element: true,
                    type: "value",
                    required: true
                },
                nc: {
                    name: "nc",
                    element: true,
                    type: "string"
                },
                cnonce: {
                    name: "cnonce",
                    element: true,
                    type: "string"
                }
            }
        },
        imsi: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                mcc: {
                    name: "mcc",
                    element: true,
                    type: "value",
                    required: true
                },
                mnc: {
                    name: "mnc",
                    element: true,
                    type: "value",
                    required: true
                },
                msin: {
                    name: "msin",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        integer_field: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                },
                base: {
                    name: "base",
                    element: true,
                    type: "integer",
                    initial: 10
                }
            }
        },
        interpolated_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                elements: {
                    name: "elements",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                }
            }
        },
        ip_address: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                }
            }
        },
        ip_address_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        ip_checksum: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                },
                after: {
                    name: "after",
                    element: true,
                    type: "reference"
                }
            }
        },
        ipv4_header: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                protocol: {
                    name: "protocol",
                    element: true,
                    type: "value",
                    required: true
                },
                src_ip: {
                    name: "src_ip",
                    element: true,
                    type: "value",
                    required: true
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        ipv6_header: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                next_header: {
                    name: "next_header",
                    element: true,
                    type: "value",
                    required: true
                },
                src_ip: {
                    name: "src_ip",
                    element: true,
                    type: "value",
                    required: true
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        layer4_checksum: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                },
                src_ip: {
                    name: "src_ip",
                    element: true,
                    type: "value",
                    required: true
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value",
                    required: true
                },
                protocol: {
                    name: "protocol",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        length_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                },
                base: {
                    name: "base",
                    element: true,
                    type: "integer",
                    initial: 10
                },
                divisor: {
                    name: "divisor",
                    element: true,
                    type: "integer",
                    initial: 1
                },
                delta: {
                    name: "delta",
                    element: true,
                    type: "integer",
                    initial: 0
                }
            }
        },
        length_type_value: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                length_width: {
                    name: "length_width",
                    element: true,
                    type: "integer",
                    required: true
                },
                length_of: {
                    name: "length_of",
                    element: true,
                    type: "enum",
                    values: ["payload","self"]
                },
                type_width: {
                    name: "type_width",
                    element: true,
                    type: "integer",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                type: {
                    name: "type",
                    element: true,
                    type: "value",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        length_uint: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                width: {
                    name: "width",
                    element: true,
                    type: "integer",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                },
                divisor: {
                    name: "divisor",
                    element: true,
                    type: "integer",
                    initial: 1
                },
                delta: {
                    name: "delta",
                    element: true,
                    type: "integer",
                    initial: 0
                }
            }
        },
        length_value: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                width: {
                    name: "width",
                    element: true,
                    type: "integer",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                length_of: {
                    name: "length_of",
                    element: true,
                    type: "enum",
                    values: ["payload","self"]
                }
            }
        },
        line: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                terminator: {
                    name: "terminator",
                    element: true,
                    type: "string",
                    initial: "\r\n"
                }
            }
        },
        mac_address48: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                }
            }
        },
        md5_digest: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                }
            }
        },
        msisdn: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                cc: {
                    name: "cc",
                    element: true,
                    type: "value",
                    required: true
                },
                ndc: {
                    name: "ndc",
                    element: true,
                    type: "value",
                    required: true
                },
                sn: {
                    name: "sn",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        name_value: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                name_value_name: {
                    name: "name_value_name",
                    element: true,
                    type: "value",
                    required: true
                },
                delimiter: {
                    name: "delimiter",
                    element: true,
                    type: "string",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        offset_uint: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                width: {
                    name: "width",
                    element: true,
                    type: "integer",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                within: {
                    name: "within",
                    element: true,
                    type: "reference",
                    required: true
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                },
                divisor: {
                    name: "divisor",
                    element: true,
                    type: "integer",
                    initial: 1
                },
                delta: {
                    name: "delta",
                    element: true,
                    type: "integer",
                    initial: 0
                }
            }
        },
        p_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                width: {
                    name: "width",
                    element: true,
                    type: "integer",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        pad_to_length: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                length: {
                    name: "length",
                    element: true,
                    type: "integer",
                    required: true
                },
                padding: {
                    name: "padding",
                    element: true,
                    type: "string",
                    initial: "\x00"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        pad_to_multiple: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                multiple: {
                    name: "multiple",
                    element: true,
                    type: "integer",
                    required: true
                },
                padding: {
                    name: "padding",
                    element: true,
                    type: "string",
                    initial: "\x00"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        path: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        quote: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                left_quote: {
                    name: "left_quote",
                    element: true,
                    type: "string",
                    initial: "\""
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                right_quote: {
                    name: "right_quote",
                    element: true,
                    type: "string",
                    initial: "\""
                }
            }
        },
        quoted_printable_encode: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                value_line_terminator: {
                    name: "value_line_terminator",
                    element: true,
                    type: "string",
                    initial: "\r\n"
                },
                line_terminator: {
                    name: "line_terminator",
                    element: true,
                    type: "string",
                    initial: "\r\n"
                }
            }
        },
        repeat: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                count: {
                    name: "count",
                    element: true,
                    type: "integer",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        sha1_digest: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                of: {
                    name: "of",
                    element: true,
                    type: "reference",
                    required: true
                }
            }
        },
        string_field: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        struct: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                elements: {
                    name: "elements",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                }
            }
        },
        tcp_header: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                src_port: {
                    name: "src_port",
                    element: true,
                    type: "value",
                    required: true
                },
                dst_port: {
                    name: "dst_port",
                    element: true,
                    type: "value",
                    required: true
                },
                seq: {
                    name: "seq",
                    element: true,
                    type: "value",
                    initial: "0"
                },
                ack: {
                    name: "ack",
                    element: true,
                    type: "value",
                    initial: "0"
                },
                flags: {
                    name: "flags",
                    element: true,
                    type: "integer",
                    initial: 0
                },
                ip: {
                    name: "ip",
                    element: true,
                    type: "reference",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        type_length_value: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                type_width: {
                    name: "type_width",
                    element: true,
                    type: "integer",
                    required: true
                },
                length_width: {
                    name: "length_width",
                    element: true,
                    type: "integer",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                type: {
                    name: "type",
                    element: true,
                    type: "value",
                    required: true
                },
                length_of: {
                    name: "length_of",
                    element: true,
                    type: "enum",
                    values: ["payload","self"]
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        type_value: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                width: {
                    name: "width",
                    element: true,
                    type: "integer",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                type: {
                    name: "type",
                    element: true,
                    type: "value",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        udp_header: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                src_port: {
                    name: "src_port",
                    element: true,
                    type: "value",
                    required: true
                },
                dst_port: {
                    name: "dst_port",
                    element: true,
                    type: "value",
                    required: true
                },
                ip: {
                    name: "ip",
                    element: true,
                    type: "reference"
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        uint: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                width: {
                    name: "width",
                    element: true,
                    type: "integer",
                    required: true
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                value: {
                    name: "value",
                    element: true,
                    type: "value",
                    required: true
                },
                delta: {
                    name: "delta",
                    element: true,
                    type: "value"
                }
            }
        },
        uri: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                scheme: {
                    name: "scheme",
                    element: true,
                    type: "value",
                    required: true
                },
                username: {
                    name: "username",
                    element: true,
                    type: "value"
                },
                password: {
                    name: "password",
                    element: true,
                    type: "value"
                },
                host: {
                    name: "host",
                    element: true,
                    type: "value",
                    required: true
                },
                port: {
                    name: "port",
                    element: true,
                    type: "value"
                },
                path: {
                    name: "path",
                    element: true,
                    type: "value"
                },
                query: {
                    name: "query",
                    element: true,
                    type: "value"
                },
                fragment: {
                    name: "fragment",
                    element: true,
                    type: "value"
                }
            }
        },
        uri_percent_encode: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                extra_safe_characters: {
                    name: "extra_safe_characters",
                    element: true,
                    type: "string",
                    initial: ""
                }
            }
        },
        utf16_encode: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                encoding: {
                    name: "encoding",
                    element: true,
                    type: "enum",
                    values: ["utf16","utf16be","utf16le"]
                },
                endian: {
                    name: "endian",
                    element: true,
                    type: "enum",
                    values: ["big","little"]
                },
                bom: {
                    name: "bom",
                    element: true,
                    type: "boolean",
                    initial: true
                }
            }
        },
        uuencode_encode: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                },
                line_terminator: {
                    name: "line_terminator",
                    element: true,
                    type: "string",
                    initial: "\r\n"
                }
            }
        },
        wget: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                base: {
                    name: "base",
                    element: true,
                    type: "value",
                    required: true
                },
                path: {
                    name: "path",
                    element: true,
                    type: "value",
                    required: true
                },
                username: {
                    name: "username",
                    element: true,
                    type: "value"
                },
                password: {
                    name: "password",
                    element: true,
                    type: "value"
                },
                size_only: {
                    name: "size_only",
                    element: true,
                    type: "boolean",
                    initial: false
                }
            }
        },
        xdr_array: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                elements: {
                    name: "elements",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                }
            }
        },
        xdr_list: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                elements: {
                    name: "elements",
                    element: true,
                    type: "array",
                    of: "field",
                    required: true
                }
            }
        },
        xdr_opaque: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        xdr_string: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        xml_attribute: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                attribute_name: {
                    name: "attribute_name",
                    element: true,
                    type: "string",
                    required: true
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        xml_cdata: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        xml_declaration: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                attributes: {
                    name: "attributes",
                    element: true,
                    type: "array",
                    of: "field"
                }
            }
        },
        xml_document_type: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                doctype_name: {
                    name: "doctype_name",
                    element: true,
                    type: "value",
                    required: true
                },
                external_id: {
                    name: "external_id",
                    element: true,
                    type: "enum",
                    values: ["none","System","Public"]
                },
                system_identifier: {
                    name: "system_identifier",
                    element: true,
                    type: "value"
                },
                public_identifier: {
                    name: "public_identifier",
                    element: true,
                    type: "value"
                },
                internal_subset: {
                    name: "internal_subset",
                    element: true,
                    type: "array",
                    of: "field"
                }
            }
        },
        xml_element: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                element_name: {
                    name: "element_name",
                    element: true,
                    type: "string",
                    required: true
                },
                attributes: {
                    name: "attributes",
                    element: true,
                    type: "array",
                    of: "field"
                },
                content: {
                    name: "content",
                    element: true,
                    type: "array",
                    of: "field"
                }
            }
        },
        xml_processing_instruction: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                target: {
                    name: "target",
                    element: true,
                    type: "value",
                    required: true
                },
                instruction: {
                    name: "instruction",
                    element: true,
                    type: "field"
                }
            }
        },
        xml_text: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        },
        zlib_compress: {
            attributes: {
                name: {
                    name: "name",
                    type: "string"
                },
                label: {
                    name: "label",
                    type: "string"
                },
                value: {
                    name: "value",
                    element: true,
                    type: "field",
                    required: true
                }
            }
        }
    },
    step: {
        ethernet: {
            transport: true,
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                timeout: {
                    name: "timeout",
                    element: true,
                    type: "integer"
                },
                src: {
                    name: "src",
                    element: true,
                    type: "hostref"
                },
                dst: {
                    name: "dst",
                    element: true,
                    type: "hostref"
                },
                filter: {
                    name: "filter",
                    element: true,
                    type: "value",
                    initial: "(ether dst src_mac or (ether broadcast and ether src not src_mac))"
                },
                type: {
                    name: "type",
                    element: true,
                    type: "value",
                    initial: "0x0800"
                }
            }
        },
        ethernet_client_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        ethernet_client_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                },
                dst_mac: {
                    name: "dst_mac",
                    element: true,
                    type: "value"
                }
            }
        },
        ethernet_server_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        ethernet_server_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                },
                dst_mac: {
                    name: "dst_mac",
                    element: true,
                    type: "value"
                }
            }
        },
        ip: {
            transport: true,
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                timeout: {
                    name: "timeout",
                    element: true,
                    type: "integer"
                },
                src: {
                    name: "src",
                    element: true,
                    type: "hostref"
                },
                dst: {
                    name: "dst",
                    element: true,
                    type: "hostref"
                },
                via: {
                    name: "via",
                    element: true,
                    type: "hostref"
                },
                src_ip: {
                    name: "src_ip",
                    element: true,
                    type: "value"
                },
                via_ip: {
                    name: "via_ip",
                    element: true,
                    type: "value"
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value"
                },
                dscp: {
                    name: "dscp",
                    element: true,
                    type: "value"
                },
                protocol: {
                    name: "protocol",
                    element: true,
                    type: "value",
                    required: true
                },
                multicast_groups: {
                    name: "multicast_groups",
                    element: true,
                    type: "value"
                },
                multicast_ttl: {
                    name: "multicast_ttl",
                    element: true,
                    type: "value"
                }
            }
        },
        ip_client_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        ip_client_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value"
                }
            }
        },
        ip_server_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        ip_server_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value"
                }
            }
        },
        sctp: {
            transport: true,
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                timeout: {
                    name: "timeout",
                    element: true,
                    type: "integer"
                },
                src: {
                    name: "src",
                    element: true,
                    type: "hostref"
                },
                dst: {
                    name: "dst",
                    element: true,
                    type: "hostref"
                },
                via: {
                    name: "via",
                    element: true,
                    type: "hostref"
                },
                src_ip: {
                    name: "src_ip",
                    element: true,
                    type: "value"
                },
                via_ip: {
                    name: "via_ip",
                    element: true,
                    type: "value"
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value"
                },
                dscp: {
                    name: "dscp",
                    element: true,
                    type: "value"
                },
                src_port: {
                    name: "src_port",
                    element: true,
                    type: "value"
                },
                via_port: {
                    name: "via_port",
                    element: true,
                    type: "value"
                },
                dst_port: {
                    name: "dst_port",
                    element: true,
                    type: "value"
                },
                type: {
                    name: "type",
                    element: true,
                    type: "enum",
                    values: ["client","server"]
                },
                in_streams: {
                    name: "in_streams",
                    element: true,
                    type: "value",
                    required: true
                },
                out_streams: {
                    name: "out_streams",
                    element: true,
                    type: "value",
                    required: true
                }
            }
        },
        sctp_client_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        sctp_client_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                },
                sid: {
                    name: "sid",
                    element: true,
                    type: "value"
                },
                ppid: {
                    name: "ppid",
                    element: true,
                    type: "value"
                }
            }
        },
        sctp_server_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        sctp_server_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                },
                sid: {
                    name: "sid",
                    element: true,
                    type: "value"
                },
                ppid: {
                    name: "ppid",
                    element: true,
                    type: "value"
                }
            }
        },
        ssl: {
            transport: true,
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                timeout: {
                    name: "timeout",
                    element: true,
                    type: "integer"
                },
                src: {
                    name: "src",
                    element: true,
                    type: "hostref"
                },
                dst: {
                    name: "dst",
                    element: true,
                    type: "hostref"
                },
                via: {
                    name: "via",
                    element: true,
                    type: "hostref"
                },
                src_ip: {
                    name: "src_ip",
                    element: true,
                    type: "value"
                },
                via_ip: {
                    name: "via_ip",
                    element: true,
                    type: "value"
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value"
                },
                dscp: {
                    name: "dscp",
                    element: true,
                    type: "value"
                },
                src_port: {
                    name: "src_port",
                    element: true,
                    type: "value"
                },
                via_port: {
                    name: "via_port",
                    element: true,
                    type: "value"
                },
                dst_port: {
                    name: "dst_port",
                    element: true,
                    type: "value"
                },
                type: {
                    name: "type",
                    element: true,
                    type: "enum",
                    values: ["client","server"]
                },
                mss: {
                    name: "mss",
                    element: true,
                    type: "value"
                },
                filter: {
                    name: "filter",
                    element: true,
                    type: "extracted_value"
                },
                family: {
                    name: "family",
                    element: true,
                    type: "enum",
                    values: ["http","none"]
                },
                ssl_version: {
                    name: "ssl_version",
                    element: true,
                    type: "enum",
                    values: ["tcp","sslv2","sslv3","sslv23","tlsv1"]
                },
                defer_ssl_connect: {
                    name: "defer_ssl_connect",
                    element: true,
                    type: "boolean",
                    initial: false
                },
                client_key: {
                    name: "client_key",
                    element: true,
                    type: "value"
                },
                client_cert: {
                    name: "client_cert",
                    element: true,
                    type: "value"
                }
            }
        },
        ssl_client_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        ssl_client_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                }
            }
        },
        ssl_connect: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                }
            }
        },
        ssl_server_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        ssl_server_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                }
            }
        },
        tcp: {
            transport: true,
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                timeout: {
                    name: "timeout",
                    element: true,
                    type: "integer"
                },
                src: {
                    name: "src",
                    element: true,
                    type: "hostref"
                },
                dst: {
                    name: "dst",
                    element: true,
                    type: "hostref"
                },
                via: {
                    name: "via",
                    element: true,
                    type: "hostref"
                },
                src_ip: {
                    name: "src_ip",
                    element: true,
                    type: "value"
                },
                via_ip: {
                    name: "via_ip",
                    element: true,
                    type: "value"
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value"
                },
                dscp: {
                    name: "dscp",
                    element: true,
                    type: "value"
                },
                src_port: {
                    name: "src_port",
                    element: true,
                    type: "value"
                },
                via_port: {
                    name: "via_port",
                    element: true,
                    type: "value"
                },
                dst_port: {
                    name: "dst_port",
                    element: true,
                    type: "value"
                },
                type: {
                    name: "type",
                    element: true,
                    type: "enum",
                    values: ["client","server"]
                },
                mss: {
                    name: "mss",
                    element: true,
                    type: "value"
                },
                filter: {
                    name: "filter",
                    element: true,
                    type: "extracted_value"
                },
                family: {
                    name: "family",
                    element: true,
                    type: "enum",
                    values: ["http","dns","none"]
                }
            }
        },
        tcp_client_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        tcp_client_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                }
            }
        },
        tcp_server_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        tcp_server_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                }
            }
        },
        udp: {
            transport: true,
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                timeout: {
                    name: "timeout",
                    element: true,
                    type: "integer"
                },
                src: {
                    name: "src",
                    element: true,
                    type: "hostref"
                },
                dst: {
                    name: "dst",
                    element: true,
                    type: "hostref"
                },
                via: {
                    name: "via",
                    element: true,
                    type: "hostref"
                },
                src_ip: {
                    name: "src_ip",
                    element: true,
                    type: "value"
                },
                via_ip: {
                    name: "via_ip",
                    element: true,
                    type: "value"
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value"
                },
                dscp: {
                    name: "dscp",
                    element: true,
                    type: "value"
                },
                src_port: {
                    name: "src_port",
                    element: true,
                    type: "value"
                },
                via_port: {
                    name: "via_port",
                    element: true,
                    type: "value"
                },
                dst_port: {
                    name: "dst_port",
                    element: true,
                    type: "value"
                },
                type: {
                    name: "type",
                    element: true,
                    type: "enum",
                    values: ["client","server"]
                },
                multicast_groups: {
                    name: "multicast_groups",
                    element: true,
                    type: "value"
                },
                multicast_ttl: {
                    name: "multicast_ttl",
                    element: true,
                    type: "value"
                },
                filter: {
                    name: "filter",
                    element: true,
                    type: "extracted_value"
                },
                family: {
                    name: "family",
                    element: true,
                    type: "enum",
                    values: ["gtpv2","gtp","dns","none"]
                }
            }
        },
        udp_client_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        udp_client_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value"
                },
                dst_port: {
                    name: "dst_port",
                    element: true,
                    type: "value"
                }
            }
        },
        udp_server_receive: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "extracted_value"
                },
                variables: {
                    name: "variables",
                    element: true,
                    type: "array",
                    of: "variable"
                },
                assertions: {
                    name: "assertions",
                    element: true,
                    type: "array",
                    of: "assertion"
                }
            }
        },
        udp_server_send: {
            attributes: {
                name: {
                    name: "name",
                    element: true,
                    type: "string"
                },
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                transport: {
                    name: "transport",
                    element: true,
                    type: "string",
                    required: true
                },
                payload: {
                    name: "payload",
                    element: true,
                    type: "array",
                    of: "field"
                },
                mutable: {
                    name: "mutable",
                    element: true,
                    type: "boolean",
                    initial: true
                },
                delay: {
                    name: "delay",
                    element: true,
                    type: "value"
                },
                dst_ip: {
                    name: "dst_ip",
                    element: true,
                    type: "value"
                },
                dst_port: {
                    name: "dst_port",
                    element: true,
                    type: "value"
                }
            }
        }
    },
    parsed_value: {
        dns: {
            attributes: {
                offset: {
                    name: "offset",
                    element: true,
                    type: "integer",
                    initial: 0
                },
                length: {
                    name: "length",
                    element: true,
                    type: "integer",
                    initial: 0
                },
                decode: {
                    name: "decode",
                    element: true,
                    type: "enum",
                    values: ["string","uint","uint_le","mac_address","mac_address_le","ipv4_address","ipv4_address_le","ipv6_address","ipv6_address_le","ftp_ip","ftp_port","base64","hex","quoted_printable","utf16","utf16be","utf16le","uuencode"]
                },
                section: {
                    name: "section",
                    element: true,
                    type: "enum",
                    values: ["query","answer","authority","additional"]
                },
                index: {
                    name: "index",
                    element: true,
                    type: "integer",
                    initial: 0
                },
                field: {
                    name: "field",
                    element: true,
                    type: "enum",
                    values: ["name","type","klass","ttl","rdata"]
                }
            }
        },
        gtp: {
            attributes: {
                offset: {
                    name: "offset",
                    element: true,
                    type: "integer",
                    initial: 0
                },
                length: {
                    name: "length",
                    element: true,
                    type: "integer",
                    initial: 0
                },
                decode: {
                    name: "decode",
                    element: true,
                    type: "enum",
                    values: ["string","uint","uint_le","mac_address","mac_address_le","ipv4_address","ipv4_address_le","ipv6_address","ipv6_address_le","ftp_ip","ftp_port","base64","hex","quoted_printable","utf16","utf16be","utf16le","uuencode"]
                },
                type: {
                    name: "type",
                    element: true,
                    type: "integer",
                    required: true
                },
                index: {
                    name: "index",
                    element: true,
                    type: "integer",
                    initial: 0
                }
            }
        },
        gtpv2: {
            attributes: {
                offset: {
                    name: "offset",
                    element: true,
                    type: "integer",
                    initial: 0
                },
                length: {
                    name: "length",
                    element: true,
                    type: "integer",
                    initial: 0
                },
                decode: {
                    name: "decode",
                    element: true,
                    type: "enum",
                    values: ["string","uint","uint_le","mac_address","mac_address_le","ipv4_address","ipv4_address_le","ipv6_address","ipv6_address_le","ftp_ip","ftp_port","base64","hex","quoted_printable","utf16","utf16be","utf16le","uuencode"]
                },
                type: {
                    name: "type",
                    element: true,
                    type: "integer",
                    required: true
                },
                instance: {
                    name: "instance",
                    element: true,
                    type: "integer",
                    initial: 0
                }
            }
        },
    },
    assertion: {
        compare: {
            attributes: {
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                operation: {
                    name: "operation",
                    element: true,
                    type: "enum",
                    values: ["equal","equal_ignore_case","not_equal","less_than","less_than_or_equal","greater_than","greater_than_or_equal"],
                    required: true
                },
                value1: {
                    name: "value1",
                    element: true,
                    type: "value",
                    required: true
                },
                value2: {
                    name: "value2",
                    element: true,
                    type: "extracted_value",
                    required: true
                }
            }
        },
        match: {
            attributes: {
                description: {
                    name: "description",
                    element: true,
                    type: "string"
                },
                operation: {
                    name: "operation",
                    element: true,
                    type: "enum",
                    values: ["match","no_match"]
                },
                pattern: {
                    name: "pattern",
                    element: true,
                    type: "string",
                    required: true
                }
            }
        }
    }
};

// --------------------------------------------------------------------------
// Interface for creating various objects from the MuSL format. The methods
// of this interface are created as and when the actions for the MuSL grammar
// are invoked. The resulting objects are opaque as far as the MuSL parser
// is concerned.
// --------------------------------------------------------------------------
var musl = musl || {};
musl.Factory = function() {
    var UINT_MAX = 4294967295;

    var RE_INTERPOLATE = /#\{([^\}]+)\}/;
    var RE_ID_S        = "[a-zA-Z_][a-zA-Z0-9_]*";
    var RE_OPTION      = new RegExp("^\\$(" + RE_ID_S + ")$");
    var RE_GLOBAL_VAR  = new RegExp("^@(" + RE_ID_S + ")$");
    var RE_STEP_VAR    = new RegExp("^@(" + RE_ID_S + ")\\.(" + RE_ID_S + ")$");
    var RE_HOST_VAR    = new RegExp("^&(" + RE_ID_S + ")\\.(" + RE_ID_S + ")$");

    // Add the line number from the context to the AST object
    var x = function(ctx, obj) {
        obj._line = ctx.getLine();
        return obj;
    };

    var assert = function(ctx, expr, message) {
        if (expr === false) {
            ctx.error(message);
        }
    };

    // Create an object from Schema using the type (field, step, etc) and
    // the class. For the most part, we just fill in the defaults, if any,
    // from the schema. In addition we also store the type and klass of
    // the object into the instance of the object.
    var create_from_schema = function(ctx, _type, _klass) {
        var xklass = musl.Schema[_type][_klass];
        assert(ctx, xklass !== undefined, 'unknown ' + _type + " '" + _klass + "'");

        var obj = { _type: _type, _klass: _klass };
        var xattrs = xklass.attributes;
        if (xattrs) {
            for (var i in xattrs) {
                if (xattrs.hasOwnProperty(i)) {
                    var xobj = xattrs[i];
                    if (xobj.initial) {
                        if (xobj.type === 'value') {
                            obj[i] = { _type: 'value', _klass: 'string', value: xobj.initial };
                        } else {
                            obj[i] = xobj.initial;
                        }
                    }

                    if (xobj.type === 'array') {
                        if (xobj.of === 'field' || xobj.of === 'value') {
                            obj[i] = [];
                        }
                    }
                }
            }
        }

        return x(ctx, obj);
    };

    // Look for the magic markers and see if we should create a regular
    // string or an interpolated string.
    var create_string_field = function(ctx, value) {
        if (value.length === 0) {
            return musl.Factory.field.string_field(ctx, value);
        }

        var elements = [];
        var _str = value + '';

        // Look for possible interpolation within double-quoted strings. If we don't
        // find the magic marker within a double-quoted string, then treat it as a
        // normal string.
        while (_str.length !== 0) {
            if (RE_INTERPOLATE.test(_str) === false) {
                break;
            }

            var token = RegExp.$1;
            var preMatch = RegExp.leftContext;
            var postMatch = RegExp.rightContext;
            if (preMatch.length > 0) {
                elements.push(musl.Factory.field.string_field(ctx, preMatch));
            }

            // We can currently only have options and variables within the
            // interpolated string.
            if (RE_OPTION.test(token)) {
                elements.push(musl.Factory.field.string_option(ctx, RegExp.$1));
            } else if (RE_GLOBAL_VAR.test(token)) {
                elements.push(musl.Factory.field.string_global(ctx, RegExp.$1));
            } else if (RE_STEP_VAR.test(token)) {
                elements.push(musl.Factory.field.string_variable(ctx, RegExp.$1, RegExp.$2));
            } else if (RE_HOST_VAR.test(token)) {
                elements.push(musl.Factory.field.string_host_variable(ctx, RegExp.$1, RegExp.$2));
            } else {
                ctx.error("unknown value " + token + " in string");
            }

            _str = postMatch;
        }

        // Add any left over postMatch to the elements array
        if (_str.length > 0) {
            elements.push(musl.Factory.field.string_field(ctx, _str));
        }

        // If we didn't find any interpolated values, then create just a
        // regular string
        if (elements.length === 1 && elements[0].value._klass === 'string') {
            return musl.Factory.field.string_field(ctx, value);
        }

        // Create the interpolated string with the appropriate values
        var istring = musl.Factory.field.create(ctx, 'interpolated_string');
        istring.elements = elements;
        return istring;
    };

    return {
        host: {
            create: function(ctx, id) {
                return x(ctx, { _type: 'host', _klass: 'host', id: id });
            },
            reference: function(ctx, host) {
                return x(ctx, {
                    _type: 'host', _klass: 'reference',
                    _index: host._index,
                    id: host.id
                });
            }
        },
        option: {
            create: function(ctx, id, value) {
                return x(ctx, { _type: 'option', id: id, name: id, value: value });
            }
        },
        global: {
            string: function(ctx, value) {
                return x(ctx, { _type: 'global', _klass: 'string', name: null, value: value });
            },
            random_integer: function(ctx, max, delta) {
                max   = max   || 10;
                delta = delta || 0;
                assert(ctx, max >= 1 && max <= UINT_MAX, 'max ' + max + ' is out of allowed range');
                assert(ctx, (max + delta) >= 1 && (max + delta) <= UINT_MAX, 'value ' + (max + delta) + ' is out of allowed range');
                return x(ctx, { _type: 'global', _klass: 'random_integer', name: null, max: max, delta: delta });
            },
            random_string: function(ctx, length) {
                length = length || 10;
                assert(ctx, length >= 1 && length <= UINT_MAX, 'length ' + length + ' is out of allowed range');
                return x(ctx, { _type: 'global', _klass: 'random_string', name: null, length: length });
            },
            random_bytes: function(ctx, length) {
                length = length || 10;
                assert(ctx, length >= 1 && length <= UINT_MAX, 'length ' + length + ' is out of allowed range');
                return x(ctx, { _type: 'global', _klass: 'random_bytes', name: null, length: length });
            },
            instance_id: function(ctx) {
                return x(ctx, { _type: 'global', _klass: 'instance_id', name: null });
            },
            custom_fill: function(ctx) {
                return x(ctx, { _type: 'global', _klass: 'custom_fill', name: null });
            }

        },
        assertion: {
            compare: function(ctx, value1, op, value2) {
                return x(ctx, { _type: 'assertion', _klass: 'compare', value1: value1, operation: op, value2: value2 });
            },
            match: function(ctx, pattern, op) {
                return x(ctx, { _type: 'assertion', _klass: 'match', pattern: pattern, operation: op });
            }
        },
        variable: {
            create: function(ctx, name, value) {
                return x(ctx, { _type: 'variable', _klass: 'variable', name: name, value: value });
            }
        },
        host_variable: {
            create: function(ctx, name, value) {
                return x(ctx, { _type: 'host_variable', _klass: 'host_variable', name: name, value: value });
            }
        },
        value: {
            string: function(ctx, value) {
                return { _type: 'value', _klass: 'string', value: value.toString() };
            },
            option: function(ctx, option) {
                return { _type: 'value', _klass: 'option', _index: option._index, id: option.id };
            },
            global: function(ctx, global) {
                return { _type: 'value', _klass: 'global', _index: global._index, name: global.name };
            },
            variable: function(ctx, variable) {
                return { _type: 'value', _klass: 'variable', _index: variable._index, name: variable.name, step: variable.step };
            },
            host_variable: function(ctx, host_variable) {
                return { _type: 'value', _klass: 'host_variable', _index: host_variable._index, host: host_variable.host, name: host_variable.name };
            },
            regex: function(ctx, pattern, index) {
                // TODO: Handle multiline and ignore_case
                index = index || 1;
                return x(ctx, { _type: 'extracted_value', _klass: 'regex', decode: 'string', pattern: pattern, index: index });
            },
            range: function(ctx, offset, length) {
                return x(ctx, { _type: 'extracted_value', _klass: 'range', decode: 'string', offset: offset, length: length });
            },
            parse: function(ctx, name) {
                return create_from_schema(ctx, 'parsed_value', name)
            }
        },
        field: {
            create: function(ctx, name) {
                return create_from_schema(ctx, 'field', name);
            },
            coerce: function(ctx, xval) {
                if (xval._type === 'field') {
                    return xval;
                } else if (xval._type === 'option') {
                    return musl.Factory.field.string_option(ctx, xval.id);
                } else if (xval._type === 'global') {
                    return musl.Factory.field.string_global(ctx, xval.name);
                } else if (xval._type === 'variable') {
                    return musl.Factory.field.string_variable(ctx, xval.step, xval.name);
                } else if (xval._type === 'host_variable') {
                    return musl.Factory.field.string_host_variable(ctx, xval.host, xval.name);
                } else if (typeof(xval) === 'string') {
                    return musl.Factory.field.string(ctx, xval);
                } else if (typeof(xval) === 'number') {
                    return musl.Factory.field.string(ctx, xval.toString());
                }
            },
            binary: function(ctx, value, encoding) {
                var field = musl.Factory.field.create(ctx, 'binary');
                field.encoding = encoding;
                field.value = musl.Factory.value.string(ctx, value);
                return field;
            },
            diameter_avp: function(ctx, code) {
                assert(ctx, code >= 0 && code <= 0xffffffff, "code needs to be between 0 and 0xffffffff");
                var field = musl.Factory.field.create(ctx, 'diameter_avp');
                field.code = code;
                return field;
            },
            gtpv2_ie: function(ctx, type) {
                assert(ctx, type >= 0 && type <= 0xffffffff, "type needs to be between 0 and 0xffffffff");
                var field = musl.Factory.field.create(ctx, 'gtpv2_ie');
                field.type = type;
                return field;
            },
            ip: function(ctx, value) {
                var field = musl.Factory.field.create(ctx, 'ip_address');
                field.value = musl.Factory.value.string(ctx, value);
                return field;
            },
            ltv: function(ctx, lwidth, twidth) {
                assert(ctx, lwidth >= 1 && lwidth <= 64, "Length width needs to be between 1 and 64");
                assert(ctx, twidth >= 1 && twidth <= 64, "Type width needs to be between 1 and 64");
                var field = musl.Factory.field.create(ctx, 'length_type_value');
                field.length_width = lwidth;
                field.type_width = twidth;
                return field;
            },
            lv: function(ctx, lwidth) {
                assert(ctx, lwidth >= 1 && lwidth <= 64, "Length width needs to be between 1 and 64");
                var field = musl.Factory.field.create(ctx, 'length_value');
                field.width = lwidth;
                return field;
            },
            mac: function(ctx, value) {
                var field = musl.Factory.field.create(ctx, 'mac_address48');
                field.value = musl.Factory.value.string(ctx, value);
                return field;
            },
            repeat: function(ctx, value, count) {
                assert(ctx, count >= 1 && count <= 65535, "count must be between 1 and 65535");
                var field = musl.Factory.field.create(ctx, 'repeat');
                field.count = count;
                field.value = value;
                return field;
            },
            string_field: function(ctx, value) {
                var field = musl.Factory.field.create(ctx, 'string_field');
                field.value = musl.Factory.value.string(ctx, value);
                return field;
            },
            string: function(ctx, value) {
                return create_string_field(ctx, value);
            },
            string_option: function(ctx, option_name) {
                var option = ctx.options.get(option_name);
                var field = musl.Factory.field.create(ctx, 'string_field');
                field.value = musl.Factory.value.option(ctx, option);
                return field;
            },
            string_global: function(ctx, global_name) {
                var global = ctx.globals.get(global_name);
                var field = musl.Factory.field.create(ctx, 'string_field');
                field.value = musl.Factory.value.global(ctx, global);
                return field;
            },
            string_variable: function(ctx, step_name, variable_name) {
                var variable = ctx.steps.getVariable(step_name, variable_name);
                var field = musl.Factory.field.create(ctx, 'string_field');
                field.value = musl.Factory.value.variable(ctx, variable);
                return field;
            },
            string_host_variable: function(ctx, host_name, variable_name) {
                var variable = ctx.hosts.getVariable(host_name, variable_name);
                var field = musl.Factory.field.create(ctx, 'string_field');
                field.value = musl.Factory.value.host_variable(ctx, variable);
                return field;
            },
            tlv: function(ctx, twidth, lwidth) {
                assert(ctx, twidth >= 1 && twidth <= 64, "Type width needs to be between 1 and 64");
                assert(ctx, lwidth >= 1 && lwidth <= 64, "Length width needs to be between 1 and 64");
                var field = musl.Factory.field.create(ctx, 'type_length_value');
                field.type_width = twidth;
                field.length_width = lwidth;
                return field;
            },
            uint: function(ctx, value, width) {
                width = width || 32;
                assert(ctx, width >= 1 && width <= 64, 'Bit width needs to be between 1 and 64');
                var field = musl.Factory.field.create(ctx, 'uint');
                field.width = width;
                field.value = musl.Factory.value.string(ctx, value);
                return field;
            },
            uint_le: function(ctx, value, width) {
                var field = musl.Factory.field.uint(ctx, value, width);
                field.endian = 'little';
                return field;
            },
            uint_option: function(ctx, option_name, width) {
                var option = ctx.options.get(option_name);
                width = width || 32;
                assert(ctx, width >= 1 && width <= 64, 'Bit width needs to be between 1 and 64');
                var field = musl.Factory.field.create(ctx, 'uint');
                field.width = width;
                field.value = musl.Factory.value.option(ctx, option);
                return field;
            },
            uint_option_le: function(ctx, option_name, width) {
                var field = musl.Factory.field.uint_option(ctx, option_name, width);
                field.endian = 'little';
                return field;
            },
            uint_global: function(ctx, global_name, width) {
                var global = ctx.globals.get(global_name);
                width = width || 32;
                assert(ctx, width >= 1 && width <= 64, 'Bit width needs to be between 1 and 64');
                var field = musl.Factory.field.create(ctx, 'uint');
                field.width = width;
                field.value = musl.Factory.value.global(ctx, global);
                return field;
            },
            uint_global_le: function(ctx, global_name, width) {
                var field = musl.Factory.field.uint_global(ctx, global_name, width);
                field.endian = 'little';
                return field;
            },
            uint_variable: function(ctx, step_name, variable_name, width) {
                var variable = ctx.steps.getVariable(step_name, variable_name);
                width = width || 32;
                assert(ctx, width >= 1 && width <= 64, 'Bit width needs to be between 1 and 64');
                var field = musl.Factory.field.create(ctx, 'uint');
                field.width = width;
                field.value = musl.Factory.value.variable(ctx, variable);
                return field;
            },
            uint_variable_le: function(ctx, step_name, variable_name, width) {
                var field = musl.Factory.field.uint_variable(ctx, step_name, variable_name, width);
                field.endian = 'little';
                return field;
            },
            xml_attribute: function(ctx, name, value) {
                var field = musl.Factory.field.create(ctx, 'xml_attribute');
                ctx.objects.push(field);
                var _xname = musl.Factory.getAttribute(ctx, 'attribute_name');
                musl.Factory.setAttribute(ctx, _xname, name);
                var _xvalue = musl.Factory.getAttribute(ctx, 'value');
                musl.Factory.setAttribute(ctx, _xvalue, value);
                return ctx.objects.pop();
            },
            xml_element: function(ctx, name) {
                var field = musl.Factory.field.create(ctx, 'xml_element');
                field.element_name = name;
                return field;
            },
            xml_text: function(ctx, value) {
                var field = musl.Factory.field.create(ctx, 'xml_text');
                field.value = musl.Factory.field.string(ctx, value);
                return field;
            }
        },
        step: {
            createTransport: function(ctx, name) {
                var xklass = musl.Schema.step[name];
                if (!xklass || !xklass.transport) {
                    ctx.error("unsupported transport '" + name + "'");
                }

                return create_from_schema(ctx, 'step', name);
            },
            createAction: function(ctx, xport, name) {
                var step_name = xport._klass + '_' + name;
                var xklass = musl.Schema.step[step_name];
                if (!xklass || xklass.transport) {
                    ctx.error("Unknown action '" + name + "' for " + xport._klass);
                }

                var action = create_from_schema(ctx, 'step', step_name);
                action.transport = xport.name;
                action._transport_index = xport._index;
                return action;
            }
        },
        getAttribute: function(ctx, name) {
            if (name === 'send_action') name = 'description';
            var obj = ctx.objects.peek();
            var xobj = musl.Schema[obj._type][obj._klass].attributes[name];
            if (!xobj || xobj.array) {
                ctx.error("unknown attribute " + name + ' for ' + obj._klass);
            }
            return xobj;
        },
        setAttribute: function(ctx, xobj, xval) {
            var obj = ctx.objects.peek();
            var field;
            if (xobj.type === 'field') {
                if (Object.prototype.toString.apply(xval) === '[object Array]') {
                    var struct = musl.Factory.field.create(ctx, 'struct');
                    struct.elements = xval;
                    obj[xobj.name] = struct;
                    return;
                } else {
                    field = musl.Factory.field.coerce(ctx, xval);
                    if (field) {
                        obj[xobj.name] = field;
                        return;
                    }
                }
            } else if (xobj.type === 'array' && xobj.of === 'field') {
                if (Object.prototype.toString.apply(xval) === '[object Array]') {
                    obj[xobj.name] = xval;
                    return;
                } else {
                    field = musl.Factory.field.coerce(ctx, xval);
                    if (field) {
                        obj[xobj.name] = [ field ];
                        return;
                    }
                }
            } else if (xobj.type === 'reference') {
                if (typeof(xval) === 'string') {
                    obj[xobj.name] = xval;
                    ctx.fields.ref(xval);
                    return;
                }
            } else if (xobj.type === 'hostref') {
                if (xval._type === 'host') {
                    obj[xobj.name] = musl.Factory.host.reference(ctx, xval);
                    return;
                }
            } else if (xobj.type === 'value') {
                if (xval._type === 'option') {
                    obj[xobj.name] = musl.Factory.value.option(ctx, xval);
                    return;
                } else if (xval._type === 'global') {
                    obj[xobj.name] = musl.Factory.value.global(ctx, xval);
                    return;
                } else if (xval._type === 'variable') {
                    obj[xobj.name] = musl.Factory.value.variable(ctx, xval);
                    return;
                } else if (xval._type === 'host_variable') {
                    obj[xobj.name] = musl.Factory.value.host_variable(ctx, xval);
                    return;
                } else if (typeof(xval) === 'string') {
                    obj[xobj.name] = musl.Factory.value.string(ctx, xval);
                    return;
                } else if (typeof(xval) === 'number') {
                    obj[xobj.name] = musl.Factory.value.string(ctx, xval.toString());
                    return;
                }
            } else if (xobj.type === 'enum') {
                if (typeof(xval) === 'string') {
                    if (!xobj.values.find(function(s) { return s === xval; })) {
                        ctx.error('Expected one of [' + xobj.values.join(',') + ']');
                    }
                    obj[xobj.name] = xval;
                    return;
                }
            } else if (xobj.type === 'boolean') {
                if (typeof(xval) === 'boolean') {
                    obj[xobj.name] = xval;
                    return;
                } else if (typeof(xval) === 'number') {
                    obj[xobj.name] = xval ? true : false;
                    return;
                }
            } else if (xobj.type === 'integer') {
                if (typeof(xval) === 'number') {
                    obj[xobj.name] = xval;
                    return;
                } else if (typeof(xval) === 'string') {
                    obj[xobj.name] = parseInt(xval, 0);
                    return;
                }
            } else if (xobj.type === 'string') {
                if (typeof(xval) === 'string') {
                    obj[xobj.name] = xval;
                    return;
                }
            } else  if (xobj.type === 'extracted_value') {
                if (xval._klass === 'regex' || xval._klass === 'range') {
                    obj[xobj.name] = xval;
                    return;
                }
            } else if (xobj.type === 'parsed_value') {
                if (xval._klass === 'parse') {
                    obj[xobj.name] = xval;
                    return;
                }
            }
            ctx.error("can't coerce " + JSON.stringify(xval) + ' into ' + xobj.type);
        },
        checkAttributes: function(ctx, obj) {
            var required = [];
            var xattrs = musl.Schema[obj._type][obj._klass].attributes;
            for (var i in xattrs) {
                if (xattrs.hasOwnProperty(i)) {
                    var xobj = xattrs[i];
                    if (xobj.required && !obj.hasOwnProperty(xobj.name)) {
                        required.push(xobj.name);
                    }
                }
            }

            if (required.length > 0) {
                ctx.error(obj._klass + ': Need values for ' + required.join(', '));
            }
        },
        setElement: function(ctx, xobj, xval) {
            var obj = ctx.objects.peek();
            var i, _xobj;

            // Something like <field> [ ... ]. Pick an xobj that's both of
            // type field and is required. If there's more than one, then
            // we have an ambiguity. So throw an error message
            if (!xobj) {
                var xattrs = musl.Schema[obj._type][obj._klass].attributes;
                var xobjs = [];
                for (i in xattrs) {
                    if (xattrs.hasOwnProperty(i)) {
                        _xobj = xattrs[i];
                        if (_xobj.required) {
                            if (_xobj.type === 'field') {
                                xobjs.push(_xobj);
                            } else if (_xobj.type === 'array' && _xobj.of === 'field') {
                                xobjs.push(_xobj);
                            }
                        }
                    }
                }

                // If there are no required field elements, then pick all
                // xobjs of type field or array of fields. Hopefully there's
                // only one, but then we end up throwing an exception
                if (xobjs.length === 0) {
                    for (i in xattrs) {
                        if (xattrs.hasOwnProperty(i)) {
                            _xobj = xattrs[i];
                            if (_xobj.type === 'field') {
                                xobjs.push(_xobj);
                            } else if (_xobj.type === 'array' && _xobj.of === 'field') {
                                xobjs.push(_xobj);
                            }
                        }
                    }
                }

                if (xobjs.length === 0 || xobjs.length > 1) {
                    ctx.error(obj._klass + ': Ambiguous array construct');
                }

                xobj = xobjs[0];
            }

            musl.Factory.setAttribute(ctx, xobj, xval);
        },
        // Remove XMLText in e's children if they contain nothing but whitespace
        normalizeXML: function(ctx, e) {
            if (e.content.length > 0) {
                for (var i=e.content.length-1; i>=0; --i) {
                    var child = e.content[i];
                    if (child._klass !== 'xml_text') { continue; }
                    var string = child.value;
                    if (string._klass !== 'string_field') { continue; }
                    if (string.value._klass !== 'string') { continue; }
                    if (/^\s*$/.test(string.value.value)) {
                        e.content.splice(i, 1);
                    }
                }
            }

            return e;
        }
    };
}();


// A lexer for MuSL format. This returns one token at a time, which is then
// used by the musl.Parser to do the syntactic and semantic validation.
// Invoke this like this:
//
// var source = "..."
// var lexer = musl.Lexer(source);
// while (token = lexer.next()) {
//     ...
// }

Array.prototype.find = function(cb) {
    for (var i=0; i<this.length; ++i) {
        if (cb(this[i]) === true) {
            return this[i];
        }
    }
    return undefined;
};

String.prototype.count = function(ch) {
    var n = 0;
    for (var i=0; i<this.length; ++i) {
        if (this.charAt(i) === ch) {
            ++n;
        }
    }
    return n;
};

String.prototype.unescape = function() {
    var MAP = { 'n': '\n', 'r': '\r', 't': '\t', '\\': '\\', "'": "'", '"': '"' };
    var RE_SLASH = /\\[ntr'"\\]/g;
    var RE_HEX = /\\x[0-9a-fA-F]{1,2}/g;
    return function() {
        return this
            .replace(RE_SLASH, function(e) {
                return MAP[e.charAt(1)];
            })
            .replace(RE_HEX, function(h) {
                return String.fromCharCode(parseInt(h.substr(2,2), 16));
            });
    };
}();

var musl = musl || {};
musl.Lexer = function() {
    var KSCENARIO  = 'scenario|hosts|options|variables|random_bytes|random_integer|random_string|instance_id|custom_fill|steps|parse';
    var KSTEPS     = 'client_send|client_receive|server_send|server_receive|assertions';
    var IPV4_DIGIT = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)';

    var RE_WHITESPACE     = /^\s+/;
    var RE_COMMENT        = /^#([^\n]*)\n/;
    var RE_KEYWORDS       = new RegExp('^(' + KSCENARIO + '|' + KSTEPS + ')\\b');
    var RE_BOOLEAN        = /^(true|false)\b/;
    var RE_IPV4_ADDRESS   = new RegExp('^(' + IPV4_DIGIT + '\\.' + IPV4_DIGIT + '\\.' + IPV4_DIGIT + '\\.' + IPV4_DIGIT + ')\\b');
    var RE_IPV6_ADDRESS   = /^(?:(?:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7})|(?:(?!(?:.*[a-f0-9](?::|$)){7,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,5})?)))|(?:(?:(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){5}:)|(?:(?!(?:.*[a-f0-9]:){5,})(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3})?::(?:[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){0,3}:)?))?(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))(?:\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9]{2})|(?:[1-9]?[0-9]))){3}))/;
    var RE_MAC_ADDRESS    = /^[a-fA-F0-9]{1,2}(:[a-fA-F0-9]{1,2}){5}\b/;
    var RE_HEX_STRING     = /^0h[a-fA-F0-9]+/;
    var RE_BIN_STRING     = /^0b[01]+/;
    var RE_HEX_NUMBER     = /^-?0x[a-fA-F0-9]+\b/;
    var RE_LE_HEX_NUMBER  = /^-?0x[a-fA-F0-9]+[lL]\b/;
    var RE_NUMBER         = /^-?\d+\b/;
    var RE_LE_NUMBER      = /^-?\d+[lL]\b/;
    var RE_DQ_STRING      = /^"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/;
    var RE_SQ_STRING      = /^'[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*'/;
    var RE_REGEX          = /^\/[^\/\\\r\n]*(?:\\.[^\/\\\r\n]*)*\//;
    var RE_OP_EQ          = /^==/;
    var RE_OP_NE          = /^!=/;
    var RE_OP_LT          = /^</;
    var RE_OP_LE          = /^<=/;
    var RE_OP_GT          = /^>/;
    var RE_OP_GE          = /^>=/;
    var RE_TLV            = /^tlv_(\d+)_(\d+)/;
    var RE_LTV            = /^ltv_(\d+)_(\d+)/;
    var RE_LV             = /^lv_(\d+)/;
    var RE_DIAMETER_AVP   = /^diameter_avp_(\d+)/;
    var RE_GTPV2_IE       = /^gtpv2_ie_(\d+)/;
    var RE_IDENTIFIER     = /^[a-zA-Z_][a-zA-Z0-9_]*/;
    var RE_XML_ID         = /^[a-zA-Z_][a-zA-Z0-9_\-]*/;
    var RE_XML_DECL_BEGIN = /^<\?xml\b/;
    var RE_XML_DECL_END   = /^\?>/;
    var RE_XML_ELEM_END   = /^<\//;
    var RE_XML_TEXT       = /^[^<]+/;
    var RE_XML_ESC_BEGIN  = /^<%/;
    var RE_XML_ESC_END    = /^%>/;
    var RE_MISC           = /^.|\n/;

    return function(source) {
        var _text  = source;
        var _line  = 1;
        var _state = [ 'field' ]; // or 'xml'
        var _xtext = true;

        return {
            next: function() {
                var token = null;
                var match;

                var top = _state[_state.length-1];
                while (!token && _text && _text.length !== 0) {
                    // Treat white-space differently when we are inside XML
                    if (top === 'xml' && _xtext && RE_XML_TEXT.test(_text)) {
                        token = {
                            type: 'xml-text',
                            value: RegExp.lastMatch
                        };
                    }
                    // Escape to field-mode from within XML using <% ... %>
                    else if (top === 'xml' && RE_XML_ESC_BEGIN.test(_text)) {
                        token = {
                            type: 'xml-esc-begin',
                            value: RegExp.lastMatch
                        };
                    }
                    // Handle XML ID's (hyphenated)
                    else if (!_xtext && RE_XML_ID.test(_text)) {
                        token = {
                            type: 'xml-id',
                            value: RegExp.lastMatch
                        };
                    }
                    else if (RE_WHITESPACE.test(_text)) {
                        // Intentionally left blank
                    }
                    // Annotated commands in the form of name|label
                    else if (RE_COMMENT.test(_text)) {
                        match = RegExp.$1.replace(/^\s*/, '').replace(/\s*$/, '');
                        var tokens = match.split('|', 2);
                        var value = { name: tokens[0], label: tokens[1] };
                        if (tokens[0].length === 0) {
                            value.name = undefined;
                        }

                        token = {
                            type: 'comment',
                            value: value
                        };
                        RE_COMMENT.test(_text);
                    }
                    else if (RE_KEYWORDS.test(_text)) {
                        token = {
                            type: 'keyword',
                            value: RegExp.lastMatch
                        };
                    }
                    else if (RE_BOOLEAN.test(_text)) {
                        token = {
                            type: 'boolean',
                            value: RegExp.lastMatch === 'true' ? 1 : 0
                        };
                    }
                    else if (RE_IPV4_ADDRESS.test(_text)) {
                        token = {
                            type: 'ip',
                            value: RegExp.lastMatch
                        };
                    }
                    else if (RE_IPV6_ADDRESS.test(_text)) {
                        token = {
                            type: 'ip',
                            value: RegExp.lastMatch
                        };
                    }
                    else if (RE_MAC_ADDRESS.test(_text)) {
                        token = {
                            type: 'mac',
                            value: RegExp.lastMatch
                        };
                    }
                    else if (RE_HEX_STRING.test(_text)) {
                        match = RegExp.lastMatch;
                        token = {
                            type: 'hex-string',
                            value: match.substring(2)
                        };
                    }
                    else if (RE_BIN_STRING.test(_text)) {
                        match = RegExp.lastMatch;
                        token = {
                            type: 'bin-string',
                            value: match.substring(2)
                        };
                    }
                    else if (RE_HEX_NUMBER.test(_text)) {
                        token = {
                            type: 'number',
                            value: parseInt(RegExp.lastMatch, 16)
                        };
                    }
                    else if (RE_LE_HEX_NUMBER.test(_text)) {
                        match = RegExp.lastMatch;
                        token = {
                            type: 'le-number',
                            value: parseInt(match.substring(0, match.length-1), 16)
                        };
                    }
                    else if (RE_NUMBER.test(_text)) {
                        token = {
                            type: 'number',
                            value: parseInt(RegExp.lastMatch, 10)
                        };
                    }
                    else if (RE_LE_NUMBER.test(_text)) {
                        match = RegExp.lastMatch;
                        token = {
                            type: 'le-number',
                            value: parseInt(match.substring(0, match.length-1), 10)
                        };
                    }
                    // Double and single quoted strings
                    else if (RE_DQ_STRING.test(_text) || RE_SQ_STRING.test(_text)) {
                        match = RegExp.lastMatch;
                        token = {
                            type: 'string',
                            value: match.substring(1, match.length-1).unescape()
                        };
                        var _ = RE_DQ_STRING.test(_text) || RE_SQ_STRING.test(_text);
                    }
                    // XML declaration begin <?
                    else if (RE_XML_DECL_BEGIN.test(_text)) {
                        token = {
                            type: 'xml-decl-begin',
                            value: RegExp.lastMatch
                        };
                    }
                    // XML declaration end ?>
                    else if (RE_XML_DECL_END.test(_text)) {
                        token = {
                            type: 'xml-decl-end',
                            value: RegExp.lastMatch
                        };
                    }
                    // XML element end />
                    else if (RE_XML_ELEM_END.test(_text)) {
                        token = {
                            type: 'xml-elem-end',
                            value: RegExp.lastMatch
                        };
                    }
                    // XML escape end %>
                    else if (RE_XML_ESC_END.test(_text)) {
                        token = {
                            type: 'xml-esc-end',
                            value: RegExp.lastMatch
                        };
                    }
                    else if (RE_REGEX.test(_text)) {
                        match = RegExp.lastMatch;
                        token = {
                            type: 'regex',
                            value: match.substring(1, match.length-1)
                        };
                    }
                    else if (RE_OP_EQ.test(_text)) {
                        token = {
                            type: 'equal',
                            value: 'equal'
                        };
                    }
                    else if (RE_OP_NE.test(_text)) {
                        token = {
                            type: 'not_equal',
                            value: 'not_equal'
                        };
                    }
                    else if (RE_OP_LE.test(_text)) {
                        token = {
                            type: 'less_than_or_equal',
                            value: 'less_than_or_equal'
                        };
                    }
                    else if (RE_OP_LT.test(_text)) {
                        token = {
                            type: 'less_than',
                            value: 'less_than'
                        };
                    }
                    else if (RE_OP_GE.test(_text)) {
                        token = {
                            type: 'greater_than_or_equal',
                            value: 'greater_than_or_equal'
                        };
                    }
                    else if (RE_OP_GT.test(_text)) {
                        token = {
                            type: 'greater_than',
                            value: 'greater_than'
                        };
                    }
                    else if (RE_TLV.test(_text)) {
                        token = {
                            type: 'tlv',
                            value: {
                                type: parseInt(RegExp.$1, 10),
                                length: parseInt(RegExp.$2, 10)
                            }
                        };
                    }
                    else if (RE_LTV.test(_text)) {
                        token = {
                            type: 'ltv',
                            value: {
                                length: parseInt(RegExp.$1, 10),
                                type: parseInt(RegExp.$2, 10)
                            }
                        };
                    }
                    else if (RE_LV.test(_text)) {
                        token = {
                            type: 'lv',
                            value: { length: parseInt(RegExp.$1,10) }
                        };
                    }
                    else if (RE_DIAMETER_AVP.test(_text)) {
                        token = {
                            type: 'diameter_avp',
                            value: { code: parseInt(RegExp.$1,10) }
                        };
                    }
                    else if (RE_GTPV2_IE.test(_text)) {
                        token = {
                            type: 'gtpv2_ie',
                            value: { type: parseInt(RegExp.$1,10) }
                        };
                    }
                    else if (RE_IDENTIFIER.test(_text)) {
                        token = {
                            type: 'identifier',
                            value: RegExp.lastMatch
                        };
                    }
                    else if (RE_MISC.test(_text)) {
                        token = RegExp.lastMatch;
                    }

                    //console.log(RegExp.lastMatch);
                    _line += RegExp.lastMatch.count('\n');
                    _text = RegExp.rightContext;
                }

                return token;
            },
            getLine: function() {
                return _line;
            },
            push: function(mode) {
                _state.push(mode);
            },
            pop: function() {
                _state.pop();
            },
            enableXMLText: function() {
                _xtext = true;
            },
            disableXMLText: function() {
                _xtext = false;
            },
            save: function() {
                return { line: _line, text: _text, state: _state, xtext: _xtext };
            },
            restore: function(s) {
                _line  = s.line;
                _text  = s.text;
                _xtext = s.xtext;
                _state = s.state;
            }
        };
    };
}();

// A parser for the MuSL format. This is a recursive descent parser using
// function objects. The result of invoking the parser with the source (string)
// is a fully-validated JSON object that represents the AST for the MuSL
// format. This AST can then be used to generate concrete objects in many
// formats and languages.
var musl = musl || {};
musl.Parser = function() {
    // A wrapper around the Lexer and the return values of parsers so we can
    // push, pop and peek tokens in addition to handling parser errors. The
    // context also helps us try different paths in the grammar while at
    // the same time saving/restoring the lexer states.
    var Context = function(source) {
        var lexer = musl.Lexer(source);
        var stack = [];
        var tokens = [];
        var ctx = {
            getLine: function() {
                return lexer.getLine();
            },
            next: function() {
                return tokens.length > 0 ? tokens.shift() : lexer.next();
            },
            pushLexer: function(mode) {
                lexer.push(mode);
            },
            popLexer: function() {
                lexer.pop();
            },
            enableXMLText: function() {
                lexer.enableXMLText();
            },
            disableXMLText: function() {
                lexer.disableXMLText();
            },
            peek: function() {
                if (tokens.length === 0) {
                    var t = lexer.next();
                    if (t === null) {
                        return null;
                    }
                    tokens.push(t);
                }

                return tokens.shift();
            },
            unshift: function(t) {
                tokens.unshift(t);
            },
            maybe: function(p) {
                stack.push({
                    unwind: true,
                    state: lexer.save(),
                    tokens: tokens.concat([])
                });

                var rv = p(ctx);
                if (rv === false) {
                    var top = stack[stack.length-1];
                    lexer.restore(top.state);
                    tokens = top.tokens;
                }

                stack.pop();
                return rv;
            },
            must: function(p) {
                stack.push({ unwind: false });
                var rv = p(ctx);
                if (rv === false || rv === undefined) { ctx.value(false); }
                stack.pop();
                return rv;
            },
            error: function(message, line) {
                line = line || lexer.getLine();
                throw { parse: true, line: line, message: message };
            },
            value: function(v) {
                var top = stack[stack.length-1] || { unwind: false };
                if (v === false && top.unwind === false) {
                    var lv = ctx.peek();
                    if (!lv) {
                        ctx.error("unexpected EOF");
                    }
                    lv = lv.value || lv;
                    ctx.error("unexpected token: " + lv);
                }
                return v === undefined ? undefined : v;
            },
            debug: function() {
                var objs = [];
                for (var i=0; i<arguments.length; ++i) {
                    objs.push(JSON.stringify(arguments[i]));
                }
                print(objs.join(' '));
            }
        };

        return ctx;
    };

    // Parser generator for a literal string. If the lexer returns the literal
    // string or a keyword with the specified value, this returns that value.
    var literal = function(s) {
        return function(ctx) {
            var rv = ctx.next();
            if (rv) {
                if (rv === s) {
                    return ctx.value(rv);
                }
                if (rv.type === 'keyword' && rv.value === s) {
                    return ctx.value(s);
                }
            }
            ctx.unshift(rv);
            return ctx.value(false);
        };
    };

    // Convert a string into a literal parser generator. If 'p' is an object
    // then we expect the mandatory 'rule' attribute and the optional 'action'
    // attribute. Furthermore, 'rule' can be an array in which case it's
    // converted into a sequence.
    var to_p = function(p) {
        if (typeof(p) === 'string') {
            return literal(p);
        } else if (Object.prototype.toString.apply(p) === '[object Array]') {
            return sequence(p);
        } else if (typeof(p) === 'object') {
            var rule = p.rule;
            if (Object.prototype.toString.apply(rule) === '[object Array]') {
                rule = sequence(rule);
            }

            return p.action ? action(rule, p.action) : rule;
        }

        return p;
    };

    // Convert each of the members of the arguments object into a parser
    // generator
    var args_to_p = function(args) {
        if (Object.prototype.toString.apply(args[0]) === '[object Array]' &&
            args.length === 1) {
            args = args[0];
        }
        var parsers = [];
        for (var i=0; i<args.length; ++i) {
            parsers.push(to_p(args[i]));
        }
        return parsers;
    };

    // Parser generator for a typed token (like a boolean, string, number,
    // etc)
    var token = function(t) {
        var _t = typeof(t) === 'string' ? { type: t } : t;
        return function(ctx) {
            var rv = ctx.next();
            if (rv && _t.type === rv.type) {
                return ctx.value(rv.value);
            }
            ctx.unshift(rv);
            return ctx.value(false);
        };
    };

    // Parser generator for a sequence of parsers, all of which *must* succeed
    var sequence = function() {
        var parsers = args_to_p(arguments);
        return function(ctx) {
            var rv = [];
            var i;
            for (i=0; i<parsers.length; ++i) {
                var prv = parsers[i](ctx);
                if (prv === false) { break; }
                if (prv !== undefined) { rv.push(prv); }
            }

            return ctx.value(i === parsers.length ? rv : false);
        };
    };

    // Parser generator for the expression ( p (d p)* ) where p is the parser
    // and d is the delimeter. This is iterative in nature which in [yr]acc will
    // typically be two productions with left-recursion.
    var dsv = function(p, d) {
        var _p = to_p(p);
        var _d = to_p(d);

        return function(ctx) {
            var rvs = [];

            var _rv = ctx.maybe(_p);
            if (_rv === false) { return; }
            if (_rv !== undefined) { rvs.push(_rv); }

            while (true) {
                _rv = ctx.maybe(_d);
                if (_rv === false || _rv === undefined) { break; }

                _rv = ctx.must(_p);
                rvs.push(_rv);
            }

            return ctx.value(rvs.length !== 0 ? rvs : false);
        };
    };

    // Parser generator for ( p{x} ) where p is the parser. This invokes
    // parser p until it fails and then returns a list of all the parser
    // values. The min argument specifies atleast how many elements should
    // be parsed with a default of zero. This allows us to parse all of the
    // following expressions: (p)*, (p)+, (p){3}
    var list = function(p, min, terminator) {
        min = min || 0;
        var _p = to_p(p);
        var _t = terminator ? to_p(terminator) : undefined;
        return function(ctx) {
            var rv = [];
            var _rv;
            for (var i=0; i<min; ++i) {
                _rv = _p(ctx);
                rv.push(ctx.value(_rv));
            }

            while (true) {
                _rv = ctx.maybe(_p);
                if (_rv === false) {
                    if (_t) { ctx.must(_t); }
                    break;
                }
                rv.push(_rv);
            }

            return rv;
        };
    };

    // Parse generator for the expression (a | b | c | ...) using one of the
    // given parsers. If none of them succeed, then this parser fails. Each
    // of the parser generator in the choice in wrapped so that we push
    // and pop the lexer/parser states in case of failure.
    var choice = function() {
        var parsers = args_to_p(arguments);
        return function(ctx) {
            var rv, i;
            for (i=0; i<parsers.length; ++i) {
                rv = ctx.maybe(parsers[i]);
                if (rv !== undefined && rv !== false) {
                    break;
                }
            }
            return rv;
        };
    };

    // Parser generator for the expression ( p? ) where p is the parser that
    // is optional. If the invocation of p fails, then the lexer/parser state
    // is untouched.
    var optional = function(p) {
        var _p = to_p(p);
        return function(ctx) {
            var rv = ctx.maybe(_p);
            if (rv === false) { return undefined; }
            return ctx.value(rv);
        };
    };

    // Parser generator for the expression ( p ) where p is the parser that
    // *must* parse the token. If the invocation of p fails, then an exception
    // is raised.
    var required = function(p) {
        var _p = to_p(p);
        return function(ctx) {
            return ctx.must(_p);
        };
    };

    // Invoke the function f if parser generator p produces a value.
    var action = function(p, f) {
        var _p = to_p(p);
        return function(ctx) {
            var rv = _p(ctx);
            if (rv === false) { return false; }
            if (rv !== undefined) { rv = f(ctx, rv) || rv; }
            return rv;
        };
    };

    // The set of rules and actions for parsing MuSL
    var BOOLEAN        = token('boolean');
    var MAC            = token('mac');
    var HEXS           = token('hex-string');
    var BINS           = token('bin-string');
    var IP             = token('ip');
    var TLV            = token('tlv');
    var LTV            = token('ltv');
    var LV             = token('lv');
    var DIAMETER_AVP   = token('diameter_avp');
    var GTPV2_IE       = token('gtpv2_ie');
    var ID             = token('identifier');
    var NUMBER         = token('number');
    var LE_NUMBER      = token('le-number');
    var STRING         = token('string');
    var COMMENT        = token('comment');
    var REGEX          = token('regex');
    var OP_EQ          = token('equal');
    var OP_NE          = token('not_equal');
    var OP_LT          = token('less_than');
    var OP_LE          = token('less_than_or_equal');
    var OP_GT          = token('greater_than');
    var OP_GE          = token('greater_than_or_equal');
    var XML_DECL_BEGIN = token('xml-decl-begin');
    var XML_DECL_END   = token('xml-decl-end');
    var XML_ID         = token('xml-id');
    var XML_ELEM_END   = token('xml-elem-end');
    var XML_TEXT       = token('xml-text');
    var XML_ESC_BEGIN  = token('xml-esc-begin');
    var XML_ESC_END    = token('xml-esc-end');


    // -----------------------------------------------------------------
    // Comments (more like annotations) are of the form name|label.
    // -----------------------------------------------------------------
    var comment_def = {
        rule: list(COMMENT),
        action: function(ctx, rv) {
            return rv[rv.length-1] || {};
        }
    };

    // -----------------------------------------------------------------
    // Options pretty much map one-to-one with the Mu::Scenario::Option::*
    // classes. Options through the script are referenced using the $
    // variables, implying that they are scenario global.
    // -----------------------------------------------------------------
    var option_value = choice(NUMBER, STRING, BOOLEAN, function(ctx) {
        ctx.error('expected a string, number or boolean');
    });
    var option_nvp = {
        rule: [ '$', ID, '=', option_value ],
        action: function(ctx, rv) {
            var option = musl.Factory.option.create(ctx, rv[1], rv[3]);
            return ctx.options.put(option);
        }
    };
    var option_decl = {
        rule: [ comment_def, option_nvp ],
        action: function(ctx, rv) {
            var comment = rv[0];
            rv[1].name = comment.name || rv[1].name;
            rv[1].description = comment.label;
            return rv[1];
        }
    };
    var options_def = {
        rule: [ 'options', '{', list(option_decl, 0, '}') ],
        action: function(ctx, rv) {
            return rv[2];
        }
    };


    // -----------------------------------------------------------------
    // Scenario variables are global variables and are initialized when a
    // scenario is instantated. Variables is a little bit of a misnomer,
    // since these are really global constants that are initialized once
    // and referenced anywhere
    // -----------------------------------------------------------------
    var global_value = choice(
        {
            rule: STRING,
            action: function(ctx, rv) {
                return musl.Factory.global.string(ctx, rv);
            }
        },
        {
            rule: [ 'random_bytes', '(', NUMBER, ')' ],
            action: function(ctx, rv) {
                return musl.Factory.global.random_bytes(ctx, rv[2]);
            }
        },
        {
            rule: [ 'random_bytes', '(', ')' ],
            action: function(ctx, rv) {
                return musl.Factory.global.random_bytes(ctx);
            }
        },
        {
            rule: 'random_bytes',
            action: function(ctx, rv) {
                return musl.Factory.global.random_bytes(ctx);
            }
        },
        {
            rule: [ 'random_string', '(', NUMBER, ')' ],
            action: function(ctx, rv) {
                return musl.Factory.global.random_string(ctx, rv[2]);
            }
        },
        {
            rule: [ 'random_string', '(', ')' ],
            action: function(ctx, rv) {
                return musl.Factory.global.random_string(ctx);
            }
        },
        {
            rule: 'random_string',
            action: function(ctx, rv) {
                return musl.Factory.global.random_string(ctx);
            }
        },
        {
            rule: [ 'random_integer', '(', NUMBER, ',', NUMBER, ')' ],
            action: function(ctx, rv) {
                return musl.Factory.global.random_integer(ctx, rv[2], rv[4]);
            }
        },
        {
            rule: [ 'random_integer', '(', NUMBER, ')' ],
            action: function(ctx, rv) {
                return musl.Factory.global.random_integer(ctx, rv[2]);
            }
        },
        {
            rule: [ 'random_integer', '(', ')' ],
            action: function(ctx, rv) {
                return musl.Factory.global.random_integer(ctx);
            }
        },
        {
            rule: 'random_integer',
            action: function(ctx, rv) {
                return musl.Factory.global.random_integer(ctx);
            }
        },
        {
            rule: 'instance_id',
            action: function(ctx, rv) {
                return musl.Factory.global.instance_id(ctx);
            }
        },
        {
            rule: 'custom_fill',
            action: function(ctx, rv) {
                return musl.Factory.global.custom_fill(ctx);
            }
        },
        function(ctx) {
            ctx.error('expected a literal string, instance_id, custom_fill, random_bytes, random_string or random_integer');
        }
    );
    var global_nvp = {
        rule: [ '@', ID, '=', global_value ],
        action: function(ctx, rv) {
            rv[3].name = rv[1];
            return ctx.globals.put(rv[3]);
        }
    };
    var global_decl = {
        rule: [ comment_def, global_nvp ],
        action: function(ctx, rv) {
            // XXX: Variables don't have descriptions or labels
            return rv[1];
        }
    };
    var globals_def = {
        rule: [ 'variables', '{', list(global_decl, 0, '}') ],
        action: function(ctx, rv) {
            return rv[2];
        }
    };


    // -----------------------------------------------------------------
    // Generic object properties. Properties are considered to be xmlizable
    // attributes|elements that are not internal and not array's. In other
    // words simple ones. There's also some syntactic sugar to just set
    // the value of 'value' in one go. For example all these are okay:
    //
    //     uint(endian: "little", value: 0xdeadbeef)
    //     uint(0xdeadbeef)
    //     uint(@r1.var1)
    //     uint($my_option)
    //     uint(@var1)
    // -----------------------------------------------------------------
    var regex = choice(
        {
            rule: [ REGEX, ':', NUMBER ],
            action: function(ctx, rv) {
                return musl.Factory.value.regex(ctx, rv[0], rv[2]);
            }
        },
        {
            rule: REGEX,
            action: function(ctx, rv) {
                return musl.Factory.value.regex(ctx, rv);
            }
        }
    );

    var range = {
        rule: [ NUMBER, ':', NUMBER ],
        action: function(ctx, rv) {
            return musl.Factory.value.range(ctx, rv[0], rv[2]);
        }
    };

    var args_name = {
        rule: ID,
        action: function(ctx, rv) {
            return musl.Factory.getAttribute(ctx, rv);
        }
    };

    var args_value = choice(
        // Range should be before NUMBER as they both consume digits.
        regex,
        range,
        NUMBER,
        STRING,
        BOOLEAN,
        ID,
        {
            rule: [ '$', ID ],
            action: function(ctx, rv) { return ctx.options.get(rv[1]); }
        },
        {
            rule: [ '@', ID, '.', ID ],
            action: function(ctx, rv) { return ctx.steps.getVariable(rv[1], rv[3]); }
        },
        {
            rule: [ '@', ID ],
            action: function(ctx, rv) { return ctx.globals.get(rv[1]); }
        },
        {
            rule: [ '&', ID, '.', ID ],
            action: function(ctx, rv) { return ctx.hosts.getVariable(rv[1], rv[3]); }
        },
        {
            rule: [ '&', ID ],
            action: function(ctx, rv) { return ctx.hosts.get(rv[1]); }
        }

    );
    var args_nvp = {
        rule: [ args_name, ':', required(args_value) ],
        action: function(ctx, rv) {
            musl.Factory.setAttribute(ctx, rv[0], rv[2]);
        }
    };
    var args_list = choice(
        dsv(args_nvp, ','),
        {
            rule: args_value,
            action: function(ctx, rv) {
                var xobj = musl.Factory.getAttribute(ctx, 'value');
                musl.Factory.setAttribute(ctx, xobj, rv);
            }
        }
    );
    var args_def  = [ '(', args_list, ')' ];


    // -----------------------------------------------------------------
    // Hosts pretty much map one-to-one with the Mu::Scenario::Host class.
    // Hosts are referenced though using the &hostname notation.
    // -----------------------------------------------------------------
    var host_nvp = {
        rule: [
            action([ '&', ID ], function(ctx, rv) {
                var host = musl.Factory.host.create(ctx, rv[1]);
                ctx.objects.push(host);
            }),
            optional([ '=', ID, '(', args_list, ')' ])
        ],
        action: function(ctx, rv) {
            var host = ctx.objects.pop();
            ctx.hosts.put(host);
            return host;
        }
    };

    var host_decl = {
        rule: [ comment_def, host_nvp ],
        action: function(ctx, rv) {
            var comment = rv[0];
            rv[1].role = comment.name || rv[1].role;
            rv[1].description = comment.label;
            return rv[1];
        }
    };

    var hosts_def = {
        rule: [ 'hosts', '{', list(host_decl, 0, '}') ],
        action: function(ctx, rv) {
            return rv[2];
        }
    };


    // -----------------------------------------------------------------
    // Transports don't have any body. They are simply the transport name
    // and the various relevant attributes. Transport objects must be assigned
    // to some identifier so they can be referenced in the send/receive
    // actions.
    // -----------------------------------------------------------------
    var step_xport_name = {
        rule: ID,
        action: function(ctx, rv) {
            var xport = musl.Factory.step.createTransport(ctx, rv);
            return ctx.objects.push(xport);
        }
    };
    var step_xport_action = {
        rule: [
            action([ ID, '=' ], function(ctx, rv) { return ctx.steps.start(rv[0]); }),
            step_xport_name, '(', args_list, ')'
        ],
        action: function(ctx, rv) {
            var xport = rv[1];
            xport.name = rv[0];
            ctx.objects.pop();
            return ctx.steps.put(xport);
        }
    };


    // -----------------------------------------------------------------
    // There's only one kinda of action currently which is neither send
    // nor receive (SSL::Connect). This still needs to be bound to the
    // transport though
    // -----------------------------------------------------------------
    var step_other_id = {
        rule: [ ID, '.', ID ],
        action: function(ctx, rv) {
            var xport = ctx.steps.getTransport(rv[0]);
            var other = musl.Factory.step.createAction(ctx, xport, rv[2]);
            return ctx.objects.push(other);
        }
    };
    var step_other_body = [
        step_other_id,
        optional(
            choice(
                [ '(', args_list, ')' ],
                [ '(', ')' ]
            )
        )
    ];
    var step_other_action = {
        rule: choice(
            {
                rule: [
                    action([ ID, '=' ], function(ctx, rv) { return ctx.steps.start(rv[0]); }),
                    step_other_body
                ],
                action: function(ctx, rv) {
                    ctx.objects.peek().name = rv[0];
                }
            },
            step_other_body
        ),
        action: function(ctx, rv) {
            var action = ctx.objects.pop();
            return ctx.steps.put(action);
        }
    };


    // -----------------------------------------------------------------
    // The step_variable_value can be a regex or a range, further decoded
    // as something else (like mac_address_le and so on). These values are
    // then used in both step variables as well as step assertions.
    // -----------------------------------------------------------------
    var parse = {
        rule: [
            action([ 'parse' ], function(ctx, rv) {
                var step = ctx.objects.peek();
                var xport = ctx.steps.getTransport(step.transport);
                if (!xport.family) {
                    ctx.error("Parsed value require transport family to be set");
                }
                var parse_var = musl.Factory.value.parse(ctx, xport.family);
                ctx.objects.push(parse_var);
            }),
            '(', args_list, ')'
        ],
        action: function(ctx, rv) {
            return ctx.objects.pop();
        }
    };

    var step_value = choice(regex, range, parse);
    var step_variable_value = choice(
        {
            rule: [ ID, '(', step_value, ')' ],
            action: function(ctx, rv) {
                // TODO: Check that decode is valid
                rv[2].decode = rv[0];
                return rv[2];
            }
        },
        step_value
    );


    // -----------------------------------------------------------------
    // Assertions are of the form decode(extract) where the extract can
    // either be a byte-range or a regex. Decode can be uint, string,
    // base64, hex, etc
    // -----------------------------------------------------------------
    var step_assertion_match = choice(
        {
            rule: REGEX,
            action: function(ctx, rv) {
                return musl.Factory.assertion.match(ctx, rv, 'match');
            }
        },
        {
            rule: [ '!', REGEX ],
            action: function(ctx, rv) {
                return musl.Factory.assertion.match(ctx, rv[1], 'no_match');
            }
        }
    );
    var step_assertion_value = choice(
        action(STRING, function(ctx, rv) {
            return musl.Factory.value.string(ctx, rv);
        }),
        action(NUMBER, function(ctx, rv) {
            return musl.Factory.value.string(ctx, rv);
        }),
        action([ '$', ID ], function(ctx, rv) {
            var option = ctx.options.get(rv[1]);
            return musl.Factory.value.option(ctx, option);
        }),
        action([ '@', ID, '.', ID ], function(ctx, rv) {
            var variable = ctx.steps.getVariable(rv[1], rv[3]);
            return musl.Factory.value.variable(ctx, variable);
        }),
        action([ '@', ID ], function(ctx, rv) {
            var global = ctx.globals.get(rv[1]);
            return musl.Factory.value.global(ctx, global);
        }),
        function(ctx) {
            ctx.error("Invalid assertion value");
        }
    );
    var step_compare_op = choice(OP_EQ, OP_NE, OP_LT, OP_LE, OP_GT, OP_GE);
    var step_assertion_compare = {
        rule: [ step_variable_value, step_compare_op, step_assertion_value ],
        action: function(ctx, rv) {
            return musl.Factory.assertion.compare(ctx, rv[2], rv[1], rv[0]);
        }
    };
    var step_assertion_body = choice(step_assertion_compare, step_assertion_match);
    var step_assertions = {
        rule: [ comment_def, step_assertion_body ],
        action: function(ctx, rv) {
            rv[1].description = rv[0].label || rv[0].name;
            return rv[1];
        }
    };
    var step_receive_assertions = {
        rule: [ 'assertions', '{', list(step_assertions, 0, '}') ],
        action: function(ctx, rv) {
            ctx.assertions.put(rv[2]);
            ctx.objects.peek().assertions = rv[2];
        }
    };


    // -----------------------------------------------------------------
    // Variable extraction uses the same step value, but then assigns it
    // to the step so that it can be referenced further down in the subsequent
    // steps.
    // -----------------------------------------------------------------
    var step_variable_nvp = {
        rule: [ '@', ID, '=', step_variable_value ],
        action: function(ctx, rv) {
            var variable = musl.Factory.variable.create(ctx, rv[1], rv[3]);
            var step = ctx.objects.peek();
            return ctx.steps.putVariable(step, variable);
        }
    };
    var step_variables = {
        rule: [ comment_def, step_variable_nvp ],
        action: function(ctx, rv) {
            // XXX: Variables don't have a description, so ignore
            return rv[1];
        }
    };
    var step_receive_variables = [ 'variables', '{', list(step_variables, 0, '}') ];


    // -----------------------------------------------------------------
    // The receive actions (client or server) are primiarily made of
    // assertions and variables. Each receive action needs to be bound to the
    // corresponding send step (enforced by the UI). Internally we use
    // the send_action xmlizable_attribute for this. But the grammar syntax
    // becomes <send_step>.client|server_receive. Given a send step we
    // automatically extract the the transport of this step
    // -----------------------------------------------------------------
    var step_receive_body = sequence(
        '{',
            optional(step_receive_assertions),
            optional(step_receive_variables),
        '}'
    );
    var step_receive_cs_id = {
        rule: [ ID, '.', choice('client_receive', 'server_receive') ],
        action: function(ctx, rv) {
            var send, xport;
            try {
                send = ctx.steps.getSendAction(rv[0], rv[2]);
                xport = ctx.steps.getTransport(send.transport);
            } catch(e) {
                xport = ctx.steps.getTransport(rv[0]);
            }

            var action = musl.Factory.step.createAction(ctx, xport, rv[2]);
            return ctx.objects.push(action);
        }
    };
    var step_receive_cs = choice(
        {
            rule: [
                action([ ID, '=' ], function(ctx, rv) { return ctx.steps.start(rv[0]); }),
                step_receive_cs_id
            ],
            action: function(ctx, rv) {
                ctx.objects.peek().name = rv[0];
            }
        },
        step_receive_cs_id
    );
    var step_receive_action_def = choice(
        [ step_receive_cs, '(', args_list, ')', optional(step_receive_body) ],
        [ step_receive_cs, '(', ')', optional(step_receive_body) ],
        [ step_receive_cs, optional(step_receive_body) ]
    );
    var step_receive_action = action(step_receive_action_def, function(ctx, rv) {
        var action = ctx.objects.pop();
        return ctx.steps.put(action);
    });


    // -----------------------------------------------------------------
    // The send actions (client or server) are primiarily made of various
    // ways to build up the payload. While each possible field can be
    // specified in the name(a:b, c:d) { ... } form, there are some syntactic
    // sugar to coerge strings, numbers, options and variables directly
    // into fields. For example:
    //
    //     uint(width: 2, value: 12345) => 12345:2
    //     uint(width: 2, value: $opt)  => $opt:2
    //     string(value: @variable1)    => @variable1
    //
    // For nested fields (that have children) you can either have the labeling
    // syntax
    //
    //     struct {
    //         elements: [ "a" "b" "c" ]
    //     }
    //
    // or if there's only one field attribute|element
    //
    //     struct [ "a" "b" "c" ]
    // -----------------------------------------------------------------
    var field_simple = choice(
        action(STRING, function(ctx, rv) {
            return musl.Factory.field.string(ctx, rv);
        }),
        action(IP, function(ctx, rv) {
            return musl.Factory.field.ip(ctx, rv);
        }),
        action(MAC, function(ctx, rv) {
            return musl.Factory.field.mac(ctx, rv);
        }),
        action([ NUMBER, ':', NUMBER ], function(ctx, rv) {
            return musl.Factory.field.uint(ctx, rv[0], rv[2]);
        }),
        action([ NUMBER, ':', LE_NUMBER ], function(ctx, rv) {
            return musl.Factory.field.uint_le(ctx, rv[0], rv[2]);
        }),
        action(NUMBER, function(ctx, rv) {
            return musl.Factory.field.uint(ctx, rv);
        }),
        action(LE_NUMBER, function(ctx, rv) {
            return musl.Factory.field.uint_le(ctx, rv);
        }),
        action(HEXS, function(ctx, rv) {
            return musl.Factory.field.binary(ctx, rv, 'hex');
        }),
        action(BINS, function(ctx, rv) {
            return musl.Factory.field.binary(ctx, rv, 'binary');
        }),
        action([ '@', ID, ':', NUMBER ], function(ctx, rv) {
            return musl.Factory.field.uint_global(ctx, rv[1], rv[3]);
        }),
        action([ '@', ID, ':', LE_NUMBER ], function(ctx, rv) {
            return musl.Factory.field.uint_global_le(ctx, rv[1], rv[3]);
        }),
        action([ '$', ID, ':', NUMBER ], function(ctx, rv) {
            return musl.Factory.field.uint_option(ctx, rv[1], rv[3]);
        }),
        action([ '$', ID, ':', LE_NUMBER ], function(ctx, rv) {
            return musl.Factory.field.uint_option_le(ctx, rv[1], rv[3]);
        }),
        action([ '@', ID, '.', ID, ':', NUMBER ], function(ctx, rv) {
            return musl.Factory.field.uint_variable(ctx, rv[1], rv[3], rv[5]);
        }),
        action([ '@', ID, '.', ID, ':', LE_NUMBER ], function(ctx, rv) {
            return musl.Factory.field.uint_variable_le(ctx, rv[1], rv[3], rv[5]);
        }),
        action([ '@', ID, '.', ID ], function(ctx, rv) {
            return musl.Factory.field.string_variable(ctx, rv[1], rv[3]);
        }),
        action([ '&', ID, '.', ID ], function(ctx, rv) {
            return musl.Factory.field.string_host_variable(ctx, rv[1], rv[3]);
        }),
        action([ '@', ID ], function(ctx, rv) {
            return musl.Factory.field.string_global(ctx, rv[1]);
        }),
        action([ '$', ID ], function(ctx, rv) {
            return musl.Factory.field.string_option(ctx, rv[1]);
        })
    );

    var field_name = choice(
        {
            rule: ID,
            action: function(ctx, rv) {
                var field = musl.Factory.field.create(ctx, rv);
                return ctx.objects.push(field);
            }
        },
        {
            rule: TLV,
            action: function(ctx, rv) {
                var field = musl.Factory.field.tlv(ctx, rv.type, rv.length);
                return ctx.objects.push(field);
            }
        },
        {
            rule: LTV,
            action: function(ctx, rv) {
                var field = musl.Factory.field.ltv(ctx, rv.length, rv.type);
                return ctx.objects.push(field);
            }
        },
        {
            rule: LV,
            action: function(ctx, rv) {
                var field = musl.Factory.field.lv(ctx, rv.length);
                return ctx.objects.push(field);
            }
        },
        {
            rule: DIAMETER_AVP,
            action: function(ctx, rv) {
                var field = musl.Factory.field.diameter_avp(ctx, rv.code);
                return ctx.objects.push(field);
            }
        },
        {
            rule: GTPV2_IE,
            action: function(ctx, rv) {
                var field = musl.Factory.field.gtpv2_ie(ctx, rv.type);
                return ctx.objects.push(field);
            }
        }
    );
    var field_complex_decl = [
        field_name,
        optional(
            choice(
                [ '(', args_list, ')' ],
                [ '(', ')' ]
            )
        )
    ];
    // Forward declare field_def2 and initialize it the first time around
    var field_def2_cached;
    var field_def3 = function(ctx) {
        field_def2_cached = field_def2_cached || list(field_def, 0, ']');
        return field_def2_cached(ctx);
    };
    var field_element_name = {
        rule: [ ID, ':' ],
        action: function(ctx, rv) {
            return musl.Factory.getAttribute(ctx, rv[0]);
        }
    };
    var field_element_contents = {
        rule: [ '[', field_def3 ],
        action: function(ctx, rv) {
            return rv[1];
        }
    };
    var field_complex_element = {
        rule: [ field_element_name, field_element_contents ],
        action: function(ctx, rv) {
            musl.Factory.setElement(ctx, rv[0], rv[1]);
        }
    };
    var field_complex_array = {
        rule: [ '[', field_def3 ],
        action: function(ctx, rv) {
            musl.Factory.setElement(ctx, null, rv[1]);
        }
    };
    var field_complex_nvp = [ '{', list(field_complex_element, 0, '}') ];
    var field_complex2 = [
        field_complex_decl,
        optional(choice(field_complex_array, field_complex_nvp))
    ];
    var field_complex = {
        rule: field_complex2,
        action: function(ctx, rv) {
            var field = ctx.objects.pop();
            musl.Factory.checkAttributes(ctx, field);
            return field;
        }
    };

    // -----------------------------------------------------------------
    // Allow native XML into MuSL. While within the field context, one can
    // directly add XML declaration <?xml...?> or other native XML elements.
    // To switch back to the field context, use the <% ... %> syntax.
    // -----------------------------------------------------------------
    var xml_attr_name = choice(
        action([ XML_ID, ':', XML_ID ], function(ctx, rv) {
            return rv[0] + ':' + rv[2];
        }),
        XML_ID
    );

    var xml_attr_value = choice(
        action(STRING, function(ctx, rv) {
            return musl.Factory.field.string(ctx, rv);
        }),
        action([ '$', XML_ID ], function(ctx, rv) {
            return musl.Factory.field.string_option(ctx, rv[1]);
        })
    );

    var xml_attr = {
        rule: [ xml_attr_name, required([ '=', xml_attr_value ]) ],
        action: function(ctx, rv) {
            return musl.Factory.field.xml_attribute(ctx, rv[0], rv[1][1]);
        }
    };

    var xml_decl_begin = action(XML_DECL_BEGIN, function(ctx, rv) {
        ctx.disableXMLText();
        var field = musl.Factory.field.create(ctx, 'xml_declaration');
        ctx.objects.push(field);
    });

    var xml_decl_end = {
        rule: list(xml_attr, 0, XML_DECL_END),
        action: function(ctx, rv) {
            musl.Factory.setElement(ctx, null, rv);
        }
    };

    // <?xml ... ?>
    var xml_decl = {
        rule: [ xml_decl_begin, required(xml_decl_end) ],
        action: function(ctx, rv) {
            ctx.enableXMLText();
            return ctx.objects.pop();
        }
    };

    var xml_element_open = action(OP_LT, function(ctx, rv) {
        ctx.disableXMLText();
    });

    var xml_element_simple_close = {
        rule: [ xml_attr_name, list(xml_attr), '/', required(OP_GT) ],
        action: function(ctx, rv) {
            ctx.enableXMLText();
            var field = musl.Factory.field.xml_element(ctx, rv[0]);
            field.attributes = rv[1];
            return field;
        }
    };

    // <foo/> or <foo a="b" c="d"/>
    var xml_element_simple = {
        rule: [ xml_element_open, xml_element_simple_close ],
        action: function(ctx, rv) {
            return rv[1];
        }
    };

    var xml_element_complex_close = {
        rule: [ xml_attr_name, list(xml_attr), required(OP_GT) ],
        action: function(ctx, rv) {
            ctx.enableXMLText();
            ctx.pushLexer('xml');
            var field = musl.Factory.field.xml_element(ctx, rv[0]);
            field.attributes = rv[1];
            ctx.objects.push(field);
            return field;
        }
    };

    var xml_element_end2 = action(XML_ELEM_END, function(ctx, rv) {
        ctx.disableXMLText();
    });

    var xml_element_end = {
        rule: [ xml_element_end2, required([ xml_attr_name, OP_GT ]) ],
        action: function(ctx, rv) {
            var e = ctx.objects.peek();
            var name = rv[1][0];
            if (e.element_name !== name) {
                ctx.error('XML tag ' + name + " doesn't close " + e.element_name);
            }
        }
    };

    var xml_text = action(XML_TEXT, function(ctx, rv) {
        return musl.Factory.field.xml_text(ctx, rv);
    });

    var xml_escape_begin = action(XML_ESC_BEGIN, function(ctx, rv) {
        ctx.pushLexer('field');
    });

    var xml_escape_end = action(XML_ESC_END, function(ctx, rv) {
        ctx.popLexer();
    });

    var xml_escape_cached;
    var xml_escape = {
        rule: [
            xml_escape_begin,
            function(ctx) {
                xml_escape_cached = xml_escape_cached || list(field_def, 0, xml_escape_end);
                return xml_escape_cached(ctx);
            }
        ],
        action: function(ctx, rv) {
            var field = musl.Factory.field.create(ctx, 'struct');
            field.elements = rv[1];
            return field;
        }
    };

    // xml_element is not visible yet, so use closure to defer the initialization
    var xml_element2 = function(ctx) { return xml_element(ctx); };
    var xml_element_body = choice(xml_text, xml_element2, xml_escape);

    // Children of element can be text, other xml elements or escaped fields
    // We do strip XML text between elements that's just white space
    var xml_element_complex = {
        rule: [
            xml_element_open,
            xml_element_complex_close,
            list(xml_element_body, 0, xml_element_end)
        ],
        action: function(ctx, rv) {
            ctx.enableXMLText();
            ctx.popLexer();
            var field = ctx.objects.pop();
            field.content = rv[2];
            return musl.Factory.normalizeXML(ctx, field);
        }
    };

    var xml_element = choice(xml_element_simple, xml_element_complex);

    var field_xml = choice(xml_decl, xml_element);

    var field_types_def = choice(field_simple, field_complex, field_xml);
    var field_repeat_def = choice(
        {
            rule: [ NUMBER, '*', field_types_def ],
            action: function(ctx, rv) {
                return musl.Factory.field.repeat(ctx, rv[2], rv[0]);
            }
        },
        field_types_def
    );
    var field_def2 = choice(
        {
            rule: [
                action([ ID, '=' ], function(ctx, rv) { return ctx.fields.check(rv[0]); }),
                field_repeat_def
            ],
            action: function(ctx, rv) {
                return ctx.fields.put(rv[1], rv[0]);
            }
        },
        field_repeat_def
    );
    var field_def = {
        rule: [ comment_def, field_def2 ],
        action: function(ctx, rv) {
            var comment = rv[0];
            var field = rv[1];
            field.name = comment.name;
            field.label = comment.label;
            return field;
        }
    };

    var step_send_body = {
        rule: [ '{', list(field_def, 0, '}') ],
        action: function(ctx, rv) { ctx.objects.peek().payload = rv[1]; }
    };
    var step_send_cs_id = {
        rule: [ ID, '.', choice('client_send', 'server_send') ],
        action: function(ctx, rv) {
            var xport = ctx.steps.getTransport(rv[0]);
            var action = musl.Factory.step.createAction(ctx, xport, rv[2]);
            return ctx.objects.push(action);
        }
    };
    var step_send_cs = choice(
        {
            rule: [
                action([ ID, '=' ], function(ctx, rv) { return ctx.steps.start(rv[0]); }),
                step_send_cs_id
            ],
            action: function(ctx, rv) { ctx.objects.peek().name = rv[0]; }
        },
        step_send_cs_id
    );
    var step_send_action_def = [
        step_send_cs,
        choice(
            [ '(', args_list, ')', optional(step_send_body) ],
            [ '(', ')', optional(step_send_body) ],
            [ optional(step_send_body) ]
        )
    ];
    var step_send_action = action(step_send_action_def, function(ctx, rv) {
        var action = ctx.objects.pop();
        return ctx.steps.put(action);
    });

    var step_actions = choice(
        step_other_action,
        step_send_action,
        step_receive_action,
        step_xport_action
    );

    var step_actions_def = action(
        sequence(comment_def, step_actions),
        function(ctx, rv) {
            rv[1].description = rv[0].label || rv[0].name;
            return rv[1];
        }
    );
    var steps_def = {
        rule: [ 'steps', '{', list(step_actions_def, 1, '}') ],
        action: function(ctx, rv) { return rv[2]; }
    };


    var scenario_def = sequence(
        comment_def,
        'scenario', optional(args_def),
        '{',
            hosts_def,
            optional(options_def),
            optional(globals_def),
            steps_def,
        '}'
    );

    var TRANSPORT_VARIABLES = {
        ssl: [
            'src_mac', 'dst_mac', 'src_ip', 'dst_ip', 'src_port', 'dst_port'
        ],
        sctp: [
            'src_mac', 'dst_mac', 'src_ip', 'dst_ip', 'src_port', 'dst_port'
        ],
        tcp: [
            'src_mac', 'dst_mac', 'src_ip', 'dst_ip', 'src_port', 'dst_port',
            'dst_ip_from_src', 'dst_port_from_src',
            'src_ip_from_dst', 'src_port_from_dst'
        ],
        udp: [
            'src_mac', 'dst_mac', 'src_ip', 'dst_ip', 'src_port', 'dst_port',
            'dst_ip_from_src', 'dst_port_from_src',
            'src_ip_from_dst', 'src_port_from_dst'
        ],
        ip: [
            'src_mac', 'dst_mac', 'src_ip', 'dst_ip'
        ],
        ethernet: [
            'src_mac', 'dst_mac'
        ]
    };

    var HOST_VARIABLES = ['ip', 'mac'];

    // Extend the ctx for semantic processing and building the scenario AST
    return function(source, optimize) {
        var ctx = Context(source);

        var scenario = {
            _type:     'scenario',
            _klass:    'scenario',
            _host_variables: 0,
            _total_assertions: 0,
            _total_variables: 0,
            _total_transports: 0,
            hosts:     [],
            options:   [],
            variables: [],
            steps:     [],
            _wgets:    []  // for pre-fetching
        };

        var fields = { ids: {}, step: {}, refs: {} }; // field_id => true

        ctx.objects = function() {
            var stack = [];
            return {
                stack: function() {
                    return stack;
                },
                push: function(obj) {
                    stack.push(obj);
                    return obj;
                },
                pop: function() {
                    var obj = stack.pop();
                    if (obj._type === 'field' && obj._klass === 'wget') {
                        scenario._wgets.push(obj);
                    }
                    return obj;
                },
                peek: function() {
                    return stack[stack.length-1];
                }
            };
        }();

        ctx.objects.push(scenario);

        ctx.hosts = {
            put: function(host) {
                if (ctx.hosts.find(host.id)) {
                    ctx.error('Host ' + host.id + ' already exists');
                }
                host._index = scenario.hosts.length;
                scenario.hosts.push(host);

                // Add the built-in host variables and assign the appropriate
                // index to the variable. We will be using this when something
                // else references the built-in host variables
                var xvars = HOST_VARIABLES;
                host._variables = [];
                for (var i=0; i<xvars.length; ++i) {
                    if (xvars[i] === 'ip' && host.type != 'l2') {
                        var variable = musl.Factory.host_variable.create(ctx, xvars[i]);
                        variable.host = host.id;
                        variable._index = scenario._total_variables++;
                        host._variables.push(variable);
                        scenario._host_variables++;
                    }
                    if (xvars[i] === 'mac' && host.type === 'l2') {
                        var variable = musl.Factory.host_variable.create(ctx, xvars[i]);
                        variable.host = host.id;
                        variable._index = scenario._total_variables++;
                        host._variables.push(variable);
                        scenario._host_variables++;
                    }
                }

                return host;
            },
            get: function(id) {
                return ctx.hosts.find(id) || ctx.error('Unknown host ' + id);
            },
            getVariable: function(id, name) {
                var host = ctx.hosts.find(id);
                if (!host) {
                    ctx.error("Unknown host '" + id + "'");
                }

                var variables = host._variables;
                var variable = variables.find(
                    function(v) { return v.name === name; });
                if (!variable) {
                    ctx.error("Can't find variable '" + name + "' for host '" + id + "'");
                }

                return variable;
            },
            find: function(id) {
                return scenario.hosts.find(function(host) {
                    return host.id === id;
                });
            }
        };

        ctx.options = {
            put: function(option) {
                if (ctx.options.find(option.id)) {
                    ctx.error('Option ' + option.id + ' already exists');
                }
                option._index = scenario.options.length;
                scenario.options.push(option);
                return option;
            },
            get: function(id) {
                return ctx.options.find(id) || ctx.error('Unknown option ' + id);
            },
            find: function(id) {
                return scenario.options.find(function(option) {
                    return option.id === id;
                });
            }
        };

        ctx.globals = {
            put: function(global) {
                if (ctx.globals.find(global.name)) {
                    ctx.error('Variable ' + global.name + ' already exists');
                }
                global._index = scenario._total_variables++;
                scenario.variables.push(global);
                return global;
            },
            get: function(name) {
                return ctx.globals.find(name) || ctx.error('Unknown variable ' + name);
            },
            find: function(name) {
                return scenario.variables.find(function(global) {
                    return global.name === name;
                });
            }
        };

        ctx.steps = {
            start: function(name) {
                if (ctx.steps.find(name)) {
                    ctx.error('Step ' + name + ' already exists');
                }
                return name;
            },
            put: function(step) {
                if (step.name && ctx.steps.find(step.name)) {
                    ctx.error('Step ' + step.name + ' already exists');
                }

                musl.Factory.checkAttributes(ctx, step);
                for (var id in fields.refs) {
                    if (fields.refs.hasOwnProperty(id)) {
                        var line = fields.refs[id];
                        if (!fields.step.hasOwnProperty(id)) {
                            ctx.error('Undefined field ' + id, line);
                        }
                    }
                }

                // Add the built-in variables to the transport step and assign
                // the appropriate index to the variable. We will be using
                // this when something else references the built-in transport
                // variables
                if (musl.Schema.step[step._klass].transport) {
                    var xvars = TRANSPORT_VARIABLES[step._klass];
                    step._variables = [];
                    for (var i=0; i<xvars.length; ++i) {
                        var variable = musl.Factory.variable.create(ctx, xvars[i]);
                        variable.step = step.name;
                        variable._index = scenario._total_variables++;
                        step._variables.push(variable);
                    }

                    step._state_index = scenario._total_transports++;
                }

                fields.step = {};
                fields.refs = {};
                step._index = scenario.steps.length;
                scenario.steps.push(step);
                return step;
            },
            getVariable: function(step_name, variable_name) {
                var step = ctx.steps.find(step_name);
                if (!step) {
                    ctx.error("Unknown step '" + step_name + "'");
                }

                var variables = step.variables || [];
                if (musl.Schema.step[step._klass].transport) {
                    variables = step._variables;
                    // It is kind of dirty fix
                    if (('tcp' === step._klass) ||
                        ('udp' === step._klass)) {
                        var current_step = ctx.steps.current();
                        if (current_step.name) {
                            var host = ctx.steps.getHost(current_step.name);
                            if (host.id === step.src.id) {
                                // We only need to remap the dst variables as seen by
                                // the client only if there is a via element in step
                                // but seems easier/cleaner to always remap .
                                if (variable_name === 'dst_ip') {
                                    variable_name = 'dst_ip_from_src';
                                } else if (variable_name === 'dst_port') {
                                    variable_name = 'dst_port_from_src';
                                }
                            } else if (host.id === step.dst.id) {
                                // Always remap on the dst side.
                                // This way we always get the right value even if there
                                // is a source nat in between.
                                if (variable_name === 'src_ip') {
                                    variable_name = 'src_ip_from_dst';
                                } else if (variable_name === 'src_port') {
                                    variable_name = 'src_port_from_dst';
                                }
                            }
                        }
                    }
                }
                var variable = variables.find(
                    function(v) { return v.name === variable_name; });
                if (!variable) {
                    ctx.error("Can't find variable '" + variable_name + "' in step '" + step_name + "'");
                }

                return variable;
            },
            putVariable: function(step, variable) {
                if (!step.name) {
                    ctx.error("Step requires a name before it can have variables");
                }

                step.variables = step.variables || [];
                if (step.variables.find(function(v) { return v.name === variable.name; })) {
                    ctx.error("Variable '" + variable.name + "' already exists");
                }

                variable.step = step.name;
                variable._index = scenario._total_variables++;
                step.variables.push(variable);
            },
            getTransport: function(name) {
                var xport = ctx.steps.find(name);
                if (!xport || !musl.Schema.step[xport._klass].transport) {
                    ctx.error('Unknown transport ' + name);
                }
                return xport;
            },
            getSendAction: function(name, csr) {
                var action = scenario.steps[scenario.steps.length - 1];
                if (!action || action.name !== name) {
                    ctx.error("Can't find send step '" + name + "'");
                }

                if (csr === 'client_receive') {
                    if (action._klass.indexOf('_server_send') === -1) {
                        ctx.error("Can't find send step '" + name + "'");
                    }
                } else if (csr === 'server_receive') {
                    if (action._klass.indexOf('_client_send') === -1) {
                        ctx.error("Can't find send step '" + name + "'");
                    }
                }

                return action;
            },
            get: function(name) {
                return ctx.steps.find(name) || ctx.error('Unknown step ' + name);
            },
            current: function() {
                var stack = ctx.objects.stack();
                var n = stack.length - 1;
                for (var i = n; i >=0; i--) {
                    if (stack[i]._type === 'step')
                        return stack[i];
                }
                return scenario.steps[scenario.steps.length - 1];
            },
            // host that performs the given step.
            getHost: function() {
                var RE_CLIENT_ACTION = /_client_receive|_client_send/;
                var RE_SERVER_ACTION = /_server_receive|_server_send/;

                return function(step_name) {
                    var step = ctx.steps.find(step_name);
                    if (!step) {
                        step = ctx.steps.current();
                        if (step.name !== step_name) {
                            ctx.error('Step ' + step_name + ' not found');
                        }
                    }
                    var xport = ctx.steps.getTransport(step.transport);
                    if (RE_CLIENT_ACTION.test(step._klass)) {
                        return xport.src;
                    } else if (RE_SERVER_ACTION.test(step._klass)) {
                        return xport.dst;
                    }
                    ctx.error('Host that performs step ' + step_name + ' is not defined');
                }
            }(),
            find: function(name) {
                return scenario.steps.find(function(step) {
                    return step.name === name;
                });
            }
        };

        ctx.fields = {
            check: function(id) {
                if (fields.ids.hasOwnProperty(id)) {
                    ctx.error("Duplicate field id " + id);
                }
                return id;
            },
            put: function(field, id) {
                field.id = id;
                fields.ids[id] = field;
                fields.step[id] = true;
                return field;
            },
            ref: function(id) {
                fields.refs[id] = fields.refs[id] || ctx.getLine();
            }
        };

        ctx.assertions = {
            put: function(asserts) {
                for (var i=0; i<asserts.length; ++i) {
                    asserts[i]._index = scenario._total_assertions++;
                }
            }
        };

        scenario_def(ctx);
        if (optimize) {
            musl.Optimizer(scenario);
        }

        scenario._fields = fields.ids;
        return scenario;
    };
}();

// Multi-phase scenario optimization to identify portions of the AST that
// are essentially static (no references to options or variables). This,
// from a runtime perspective means that we can collapse these portions into
// static strings and hence run faster. The input to the optimizer is the
// AST produced by musl.Scenario.
//
// We first mark fields with _optimize if the field and __all__ of its
// descendents are don't have any options and variables and also don't
// have references to other fields.
var musl = musl || {};
musl.Optimizer = function() {
    function is_array(obj) {
        return Object.prototype.toString.apply(obj) === '[object Array]';
    }

    // Same as jQuery's $.each (for Arrays)
    function each(array, cb) {
        for (var i in array) {
            if (array.hasOwnProperty(i)) {
                cb(array[i]);
            }
        }
    }

    function each_with_index(array, cb) {
        for (var i=0; i<array.length; ++i) {
            cb(array[i], i);
        }
    }

    function reverse_each_with_index(array, cb) {
        for (var i=array.length-1; i>=0; --i) {
            cb(array[i], i);
        }
    }

    function count_if(array, cb) {
        var count = 0;
        for (var i in array) {
            if (array.hasOwnProperty(i)) {
                if (cb(array[i]) === true) { ++count; }
            }
        }
        return count;
    }

    // Use the cb to test each element of the array. If all of them return
    // true, then return true, otherwise false.
    function all(array, cb) {
        for (var i in array) {
            if (array.hasOwnProperty(i)) {
                if (cb(array[i]) !== true) {
                    return false;
                }
            }
        }

        return true;
    }

    // Iterate over each attribute of a schema object, with an optional filter
    function each_attribute(obj, filter, cb) {
        var klass = musl.Schema[obj._type][obj._klass];
        each(klass.attributes, function(attr) {
            if (obj.hasOwnProperty(attr.name)) {
                var value = obj[attr.name];
                if (!filter || filter(attr, value) === true) {
                    cb(attr, value);
                }
            }
        });
    }

    // Iterate over each child-field of a given field. If 'field' is an array,
    // then the cb is invoked with each element in the array
    function each_child(field, cb) {
        if (is_array(field)) {
            each(field, cb);
            return;
        }

        each_attribute(field, null, function(attr, value) {
            if (attr.type === 'field') {
                cb(value);
            } else if (attr.type === 'array' && attr.of === 'field') {
                each_child(value, cb);
            }
        });
    }

    // Depth-first traversal of a field with the cb being invoked with each
    // field in the DOM.
    function each_depth_first_child(field, cb) {
        each_child(field, function(child) {
            each_depth_first_child(child, cb);
            cb(child);
        });
    }

    // A given child can be optimized away (collapsed with other children) if
    // it's optimized and nobody else is referencing it
    function is_field_mergeable(field) {
        return field._optimize === true && !field._refs;
    }

    function merge_field_info(src, other) {
        src.arcs = src.arcs.concat(other.arcs);
        src.dynamic += other.dynamic;
        for (var id in other.fields) {
            if (other.fields.hasOwnProperty(id)) {
                src.fields[id] = other.fields[id];
            }
        }

        return src;
    }

    function can_be_optimized(field, info) {
        return all(info.arcs, function(arc) {
            var src = arc[0];
            var dst = arc[1];
            return info.fields[src] === true && info.fields[dst] === true;
        });
    }

    // ---------------------------------------------------------------------
    // Mark the field with _optimize = true, IFF the descendents and the
    // other fields it references are all static (no options and variables).
    // The algorithm works like this:
    //
    // 1. For each leaf field, we build an 'info' object that contains the
    //    number of dynamic entries (like options, variables). If the field
    //    contains references, we add the src->dst to the arcs. And finally
    //    if the field contains an 'id', we add that the fields object.
    //
    // 2. As we bubble up the stack (after recursing through the children), we
    //    check if the dynamic entries is zero. In addition we check to make
    //    sure that all the fields referenced by the arcs are contained within
    //    'this' field. If so, we mark the field with _optimize to indicate
    //    that it contains static entries.
    // ---------------------------------------------------------------------
    function optimize_field(field, id2field) {
        var info = {
            arcs: [],
            dynamic: 0,
            fields: {}
        };

        if (is_array(field)) {
            each(field, function(e) {
                merge_field_info(info, optimize_field(e, id2field));
            });

            return info;
        }

        // If we've already visited this field, then just return the last
        // computed information. This happens when we recurse down references.
        if (field._info) { return field._info; }
        field._info = info;

        // Add ourself to the info.fields
        if (field.id !== undefined) {
            info.fields[field.id] = true;
        }

        var children = [];
        var references = [];
        each_attribute(field, null, function(attr, value) {
            if (attr.type === 'field') {
                children.push(value);
            } else if (attr.type === 'array' && attr.of === 'field') {
                children = children.concat(value);
            } else if (attr.type === 'reference') {
                var of = id2field[value];
                references.push(of);
                info.arcs.push([ field.id, of.id ]);
            } else if (attr.type === 'value' && value._klass !== 'string') {
                info.dynamic++;
            }
        });

        // First recurse down all the children fields
        merge_field_info(info, optimize_field(children, id2field));

        // If this field and/or it's descendents have dynamic portions, then
        // we can't really optimize
        if (info.dynamic > 0) {
            return info;
        }

        // Recurse down the references to see if all of them are static
        each(references, function(of) {
            of._refs--;
            optimize_field(of, id2field);
        });

        // In order for us to set field._optimize, we don't care about the
        // inbound arcs to us. We only care that the things we are referencing
        // are static (if any) and that all the fields in the arcs are
        // contained within us. If that's true, 'field' + the descendents can
        // be cached statically. If there's an inbound arc to one of our
        // descendents, then we can't set optimize to true.
        if (children.length === 0 && references.length > 0) {
            if (all(references, function(r) { return r._optimize; })) {
                field._optimize = true;
            }
        } else {
            if (can_be_optimized(field, info)) {
                if (all(references, function(r) { return r._optimize; })) {
                    field._optimize = true;
                }
            }
        }

        if (field._optimize) {
            each(children, function(child) { delete child._optimize; });
        }

        // If there are inbound arcs to us from other places, add them to the
        // arcs list so our parent will know to not optimize us away. This
        // just means that there are 1 or more fields pointing to this field,
        // expecting 'this' to exist at runtime.
        if (field._arcs_in) {
            info.arcs = info.arcs.concat(field._arcs_in);
        }

        return info;
    }

    // ---------------------------------------------------------------------
    // Merge 'second' into 'first' if both are string fields and both have
    // static strings in them (no options, globals and variables)
    // ---------------------------------------------------------------------
    function merge_string_fields(first, second) {
        if (!first || !second) {
            return;
        }

        var klass = 'string_field';
        if (first._klass !== klass || second._klass != klass) {
            return;
        }

        var value1 = first.value;
        var value2 = second.value;
        if (value1._klass === 'string' && value2._klass === 'string') {
            value1.value += value2.value;
            value2.value = "";
            return true;
        }
    }

    // ---------------------------------------------------------------------
    // When we replace static global variables with strings, it's possible
    // that an entire interpolated_string ends up with nothing but strings. In
    // this case we merge all the contained strings into a simple string value
    // ---------------------------------------------------------------------
    function optimize_interpolated_string(istring) {
        var removes = [];
        each_with_index(istring.elements, function(child, index) {
            if (index === 0) { return; };
            var last = istring.elements[index-1];
            if (merge_string_fields(last, child)) {
                child.value = last.value;
                removes.push(index-1);
            }
        });

        each(removes.reverse(), function(rindex) {
            istring.elements.splice(rindex, 1);
        });
    }

    // ---------------------------------------------------------------------
    // Merge consequetive interpolated_string's and mergeable string_field's.
    // For text protocols, this minimizes the number of calls we have to make
    // to ctx.output over and over again. We also merge the last field of
    // istring-1 and the first field of istring-2 if they both happen to be
    // string-field's.
    // ---------------------------------------------------------------------
    function merge_interpolated_strings(elements) {
        var istring = null;
        var removes = [];
        each_with_index(elements, function(child, index) {
            if (child._klass === 'interpolated_string') {
                optimize_interpolated_string(child);
                if (!is_field_mergeable(child)) {
                    istring = null;
                    return;
                }

                if (istring === null) {
                    istring = child;
                    return;
                }

                var last = istring.elements[istring.elements.length-1];
                if (merge_string_fields(last, child.elements[0])) {
                    child.elements.shift();
                }

                istring.elements = istring.elements.concat(child.elements);
                removes.push(index);
                return;
            }

            if (child._klass === 'string_field') {
                if (istring && is_field_mergeable(child)) {
                    var last = istring.elements[istring.elements.length-1];
                    if (!merge_string_fields(last, child)) {
                        istring.elements.push(child);
                    }
                    removes.push(index);
                    return;
                }
            }

            istring = null;
        });

        // Now remove the children that got merged with the preceding field
        // (in reverse order so the indexes are valid during removal)
        each(removes.reverse(), function(rindex) {
            elements.splice(rindex, 1);
        });
    }

    // ---------------------------------------------------------------------
    // Look for contiguous spans of mergeable fields within our children.
    // Merge these fields into a new struct and optimize that. If the field is
    // already optimized, don't bother recursing further.
    //
    // client_send {
    //     "a"               client_send {
    //     "b"                   struct [ "a" "b" ]
    //     $foo        =>        $foo
    //     "c"                   struct [ "c" "d" ]
    //     "d"               }
    // }
    // ---------------------------------------------------------------------
    function optimize_merge(field) {
        if (is_field_mergeable(field)) {
            return;
        }

        each_child(field, optimize_merge);

        // We currently can only merge children of struct's
        if (field._klass !== 'struct') {
            return;
        }

        var children = field.elements;

        // Merge successive interpolated strings
        merge_interpolated_strings(children);

        var count = count_if(children, is_field_mergeable);
        if (count < 2 || count >= children.length) {
            return;
        }

        // Find contiguous regions of _optimize'd children
        var regions = [];
        each_with_index(children, function(child, index) {
            if (is_field_mergeable(child)) {
                var last = regions[regions.length-1];
                if (last === undefined || (last.first + last.count !== index)) {
                    regions.push({ first:index, count:1 });
                } else {
                    last.count++;
                }
            }
        });

        regions.reverse();

        // And then create new structs and push each region down into a new
        // struct and optimize that struct
        each(regions, function(r) {
            if (r.count === 1) { return; }
            var struct = { _type:'field', _klass:'struct', elements:[] };
            var slice = children.slice(r.first, r.first + r.count);
            struct.elements = struct.elements.concat(slice);
            children.splice(r.first, r.count, struct);

            struct._line = struct.elements[0]._line;
            struct._optimize = true;
            each(struct.elements, function(child) {
                delete child._optimize;
            });
        });
    }

    var string_field_from_text = function(text) {
        return {
            _type: 'field',
            _klass: 'string_field',
            value: {
                _type: 'value',
                _klass: 'string',
                value: text
            }
        };
    };

    var string_field_from_value = function(value) {
        return {
            _type: 'field',
            _klass: 'string_field',
            value: value
        };
    };

    // Named list of field klasses that we can unravel to reduce the
    // structure. By converting this into simple string fields, we flatten the
    // structure to speed up the runtime.
    var inliners = {
        dsv: function(field, elements, dsv, index) {
            reverse_each_with_index(dsv.elements, function(e, n) {
                elements.splice(index, 0, e);
                if (n > 0 && n < dsv.elements.length) {
                    var d_d = string_field_from_text(dsv.delimiter);
                    elements.splice(index, 0, d_d);
                }
            });
        },
        email: function(field, elements, email, index) {
            var e_username = string_field_from_value(email.username);
            var e_domain = string_field_from_value(email.domain);
            elements.splice(index, 0, e_domain);
            elements.splice(index, 0, string_field_from_text('@'));
            elements.splice(index, 0, e_username);
        },
        header: function(field, elements, header, index) {
            var h_terminator = string_field_from_text(header.terminator);
            var h_delimiter = string_field_from_text(header.delimiter);
            var h_header_name = string_field_from_value(header.header_name);
            elements.splice(index, 0, h_terminator);
            elements.splice(index, 0, header.value);
            elements.splice(index, 0, h_delimiter);
            elements.splice(index, 0, h_header_name);
        },
        hostname: function(field, elements, hostname, index) {
            elements.splice(index, 0, string_field_from_value(hostname.value));
        },
        line: function(field, elements, line, index) {
            var l_terminator = string_field_from_text(line.terminator);
            elements.splice(index, 0, l_terminator);
            elements.splice(index, 0, line.value);
        },
        name_value: function(field, elements, nv, index) {
            var nv_name = string_field_from_value(nv.name_value_name);
            var nv_delimiter = string_field_from_text(nv.delimiter);
            elements.splice(index, 0, nv.value);
            elements.splice(index, 0, nv_delimiter);
            elements.splice(index, 0, nv_name);
        },
        path: function(field, elements, path, index) {
            elements.splice(index, 0, string_field_from_value(path.value));
        },
        quote: function(field, elements, quote, index) {
            var q_left = string_field_from_text(quote.left_quote);
            var q_right = string_field_from_text(quote.right_quote);
            elements.splice(index, 0, q_right);
            elements.splice(index, 0, quote.value);
            elements.splice(index, 0, q_left);
        },
        struct: function(field, elements, struct, index) {
            reverse_each_with_index(struct.elements, function(e) {
                elements.splice(index, 0, e);
            });
        },
        xml_attribute: function(field, elements, attr, index) {
            var a_name = string_field_from_text(attr.attribute_name);
            // We inline attributes and convert them into simple xml_text
            // fields so we only do the escaping at runtime.  This minimizes
            // recursion depth when dealing with large number of XML
            // attributes
            elements.splice(index, 0, string_field_from_text('"'));
            elements.splice(index, 0, {
                _type: 'field',
                _klass: 'xml_text',
                value: attr.value
            });
            elements.splice(index, 0, string_field_from_text('="'));
            elements.splice(index, 0, a_name);
        },
        xml_element: function(field, elements, xml, index) {
            if (xml.content.length > 0) {
                elements.splice(index, 0, string_field_from_text('>'));
                var x_end = string_field_from_text(xml.element_name);
                elements.splice(index, 0, x_end);
                elements.splice(index, 0, string_field_from_text('</'));

                reverse_each_with_index(xml.content, function(c) {
                    elements.splice(index, 0, c);
                });

                elements.splice(index, 0, string_field_from_text('>'));
            } else {
                elements.splice(index, 0, string_field_from_text('/>'));
            }

            reverse_each_with_index(xml.attributes, function(a) {
                elements.splice(index, 0, a);
                elements.splice(index, 0, string_field_from_text(' '));
            });

            var x_beg = string_field_from_text(xml.element_name);
            elements.splice(index, 0, x_beg);
            elements.splice(index, 0, string_field_from_text('<'));
        }
    };

    // ---------------------------------------------------------------------
    // Try and inline common fields to minimize recursion depth at runtime.
    // This in some ways is the opposite of pcap2scenario in that we are
    // eliminating the underlying structure of the message into a flattened
    // list of fields for speed.
    //
    // 1. Unravel anonymous nested structs and move their children into their
    //    parent
    // 2. Inline unreferenced header fields so the header_name, delimiter and
    //    terminator can be merged with other fields
    // 3. Inline dsv's so the delimiter can be merged with other fields
    // ---------------------------------------------------------------------
    function optimize_field_structure(field) {
        each_child(field, optimize_field_structure);

        if (field._klass !== 'struct') { return; }
        var elements = field.elements;
        var inlined = false;
        do {
            inlined = false;

            reverse_each_with_index(elements, function(child, index) {
                if (child._refs !== undefined) { return; }

                if (inliners.hasOwnProperty(child._klass)) {
                    elements.splice(index, 1);
                    inliners[child._klass](field, elements, child, index);
                    inlined = true;
                }
            });
        } while (inlined === true);
    }

    function optimize_payload_struct(step, id2field) {
        // Look for static fields and optimize them. If the entire payload is
        // optimized, set the flag in the step so mus_parser_gen.cc can do the
        // right thing.
        var struct = { _type:'field', _klass:'struct', elements:step.payload };

        // Unravel common field types to flatten out the field structure
        optimize_field_structure(struct);

        optimize_field(struct, id2field);
        if (struct._optimize) {
            step._optimize = true;
        }

        // Merge contiguous spans of mergeable childs into a new struct and
        // optimize that
        optimize_merge(struct);
    }

    // ---------------------------------------------------------------------
    // Generate the reference count for each field followed by removal of
    // nested structs and optimizing each field to find the highest set of
    // parents that contain nothing but static values.
    // ---------------------------------------------------------------------
    function optimize_payload(scenario, step) {
        // Map field id's to the actual object. The musl.Parser already checks
        // to ensure that there are no duplicate id's or dangling references
        var id2field = {};
        each_depth_first_child(step.payload, function(field) {
            if (field.hasOwnProperty('id')) {
                id2field[field.id] = field;
            }
        });

        // Track down references and increment the count. In other words
        // if we have a.of(b) and c.of(b), b._refs will be 2. In addition we
        // generate id's for a and c, if not already there. This allows to
        // keep track of dependency arcs and optimize based on that.
        each_depth_first_child(step.payload, function(field) {
            each_attribute(field, null, function(attr, value) {
                if (attr.type === 'reference') {
                    var of = id2field[value];
                    of._refs = (of._refs || 0) + 1;
                    if (field.id === undefined) {
                        field.id = of.id + '-' + of._refs;
                        id2field[field.id] = field;
                    }
                    of._arcs_in = of._arcs_in || [];
                    of._arcs_in.push([ field.id, of.id ]);
                }
            });
        });

        optimize_payload_struct(step, id2field);

        // Remove all traces of the optimizer from the AST and assign unique
        // indexes to each of the fields within this payload. The step.payload
        // falls at index 0, which is why we are starting from 1.
        var index = 1;
        each_depth_first_child(step.payload, function(field) {
            field._index = index++;
            delete field._info;
            delete field._refs;
            delete field._arcs_in;
        });

        // Pre-compute the total number of fields in this step. This allows us
        // to use arrays in mus_context instead of stl:map's
        step._total_fields = index;
    }

    // ---------------------------------------------------------------------
    // Reference count the globals and variables and remove those that are not
    // used anywhere. Also find global static strings and inline them into the
    // value as appropriate. We finally renumber the globals and variables to
    // account for the removals
    // ---------------------------------------------------------------------
    function optimize_unused_variables(scenario) {
        // Storage for all kinds of variables
        var all_variables = [];

        // Start with host variables; they get added first
        each(scenario.hosts, function(host) {
            var vname;
            if (host.hasOwnProperty('_variables')) {
                vname = '_variables';
            } else {
                return;
            }

            var variables = host[vname];
            each_with_index(variables, function(v, index) {
                v._host_index = host._index;
                v._index_within_host = index;
            });

            all_variables = all_variables.concat(variables);
        });

        // Then follow scenario global variables
        var all_variables = all_variables.concat(scenario.variables);

        // Finally we add step variables; make a list of all variables,
        // including host built-ins, transport built-ins and receive variables
        each(scenario.steps, function(step) {
            var vname;
            if (step.hasOwnProperty('_variables')) {
                vname = '_variables';
            } else if (step.hasOwnProperty('variables')) {
                vname = 'variables';
            } else {
                return;
            }

            var variables = step[vname];
            each_with_index(variables, function(v, index) {
                v._step_index = step._index;
                v._index_within_step = index;
            });

            all_variables = all_variables.concat(variables);
        });

        var replace_static_global = function(obj) {
            each_attribute(obj, null, function(attr, v) {
                if (!v) { return; }
                if (v._klass === 'global') {
                    var global = scenario.variables[v._index - scenario._host_variables];
                    if (global._klass === 'string') {
                        obj[attr.name] = {
                            _type: 'value',
                            _klass: 'string',
                            value: global.value
                        };
                    } else {
                        global._refs = (global._refs || 0) + 1;
                    }
                } else if (v._klass === 'variable' || v._klass === 'host_variable') {
                    var variable = all_variables[v._index];
                    variable._refs = (variable._refs || 0) + 1;
                }
            });
        };

        each(scenario.steps, function(step) {
            // Now reference count options and variables and also remove
            // static string globals. We do this both within the step
            // attributes (like send delay) as well the payload fields
            replace_static_global(step);

            // reference count variables used in fields
            if (is_array(step.payload)) {
                each_depth_first_child(step.payload, function(field) {
                    replace_static_global(field);
                });
            }

            // reference count the receive variables used in assertions and
            // also replace global static strings
            if (step.hasOwnProperty('assertions')) {
                each(step.assertions, function(assertion) {
                    replace_static_global(assertion);
                });
            }
        });

        // Remove static string globals and unused variables
        for (var i=all_variables.length-1; i>=0; --i) {
            var v = all_variables[i];
            if (v._type === 'global' && v._klass === 'string') {
                all_variables.splice(v._index, 1);
                scenario.variables.splice(v._index - scenario._host_variables, 1);
            } else if (v._type === 'global' && !v.hasOwnProperty('_refs')) {
                all_variables.splice(v._index, 1);
                scenario.variables.splice(v._index - scenario._host_variables, 1);
            } else if (v._type === 'variable' && !v.hasOwnProperty('_refs')) {
                all_variables.splice(v._index, 1);
                var step = scenario.steps[v._step_index];
                if (step.hasOwnProperty('_variables')) {
                    step._variables.splice(v._index_within_step, 1);
                } else {
                    step.variables.splice(v._index_within_step, 1);
                }
            } else if (v._type === 'host_variable' && !v.hasOwnProperty('_refs')) {
                all_variables.splice(v._index, 1);
                var host = scenario.hosts[v._host_index];
                host._variables.splice(v._index_within_host, 1);
            }

            delete v._refs;
            delete v._host_index;
            delete v._step_index;
            delete v._index_within_host;
            delete v._index_within_step;
        }

        // Remap the indexes to account for the removed variables
        var vremap = [];
        each_with_index(all_variables, function(v, index) {
            vremap[v._index] = index;
            v._index = index;
        });

        // And update the scenario with the remapped indexes. There are three
        // places where variables can be used. In the attributes of a step, in
        // the payload and in assertions.
        each(scenario.steps, function(step) {
            each_attribute(step, null, function(attr, v) {
                if (v && (v._klass === 'global' || v._klass === 'variable' || v._klass === 'host_variable')) {
                    v._index = vremap[v._index];
                }
            });

            if (is_array(step.payload)) {
                each_depth_first_child(step.payload, function(field) {
                    each_attribute(field, null, function(attr, v) {
                        if (!v) { return; }
                        if (v._klass === 'global' || v._klass === 'variable' || v._klass === 'host_variable') {
                            v._index = vremap[v._index];
                        }
                    });
                });
                return;
            }

            if (step.hasOwnProperty('assertions')) {
                each(step.assertions, function(assertion) {
                    if (assertion._klass === 'compare') {
                        var v = assertion.value1;
                        if (v._klass == 'global' || v._klass === 'variable' || v._klass === 'host_variable') {
                            v._index = vremap[v._index];
                        }
                    }
                });
            }
        });

        // Finally update the _total_variables to accommodate the removal of
        // unused variables
        scenario._total_variables = all_variables.length;
    }

    // ---------------------------------------------------------------------
    // Given a scenario, perform a series of optimizations both globally as
    // well as within each payload for maximizing runtime performance. The
    // 'scenario' is the AST generated by the musl.Parser. All changes are
    // done directly on the AST using musl.Schema for understanding various
    // steps and fields. No objects were harmed in this process!
    // ---------------------------------------------------------------------
    return function(scenario) {
        optimize_unused_variables(scenario);

        each(scenario.steps, function(step) {
            if (is_array(step.payload)) {
                optimize_payload(scenario, step);
            }
        });
        for (var i = 0; i < scenario.steps.length; ++i) {
             if (scenario.steps[i].hasOwnProperty('_transport_index')) {
                 var idx = scenario.steps[i]._transport_index;
                 var xport = scenario.steps[idx];
                 xport._last_step_index = i;
                 if (xport._first_step_index == -1) {
                     xport._first_step_index = i;
                 }
             } else {
                 scenario.steps[i]._first_step_index = -1;
             }
         }
        return scenario;
    };
}();

// A CSV parser that handles escaped double-quotes and empty lines
// The return value of the parser looks like this:
//
// [
//     { line: 1234, tokens: [...] }
// ]
//
// If the input looks like this "a,,b", then the tokens array will have null
// values like this: [ "a", null, "b" ]. This is different from the following:
// a,"",b => [ "a", "", "b" ]
var csv = csv || {};
csv.Parser = (function() {
    // Unescape certain backslash escapes
    var unescape = function() {
        var MAP = { 'n': '\n', 'r': '\r', 't': '\t', '\\': '\\', "'": "'", '"': '"' };
        var RE_SLASH = /\\[ntr'"\\]/g;
        return function(text) {
            return text
                .replace(RE_SLASH, function(e) {
                    return MAP[e.charAt(1)];
                });
        };
    }();

    // Simple line reader. We always add a newline to the text at the end to
    // simplify the code everwhere else
    var Reader = function(text) {
        if (/\n$/.test(text) === false) {
            text = text + "\n";
        }

        var pos = 0;
        return {
            nextLine: function() {
                var ary = [];
                while (pos < text.length) {
                    ary.push(text.charAt(pos++));
                    if (ary[ary.length-1] === '\n') {
                        return ary.join('');
                    }
                }
                return null;
            }
        };
    };

    var RE_COMMA     = /^,/;
    var RE_CRLF      = /^\r?\n/;
    var RE_DQ_STRING = /^"[^"\\\r\n]*(?:\\.[^"\\\r\n]*)*"/;
    var RE_CHARS     = /^[^,"\r\n]+/;

    return function(text) {
        var reader = Reader(text);
        var result = [];
        var lineNo = 0;

        while (true) {
            var line = reader.nextLine();
            if (line === null) {
                break;
            }

            lineNo++;
            var tokens = [];
            var token = null;
            while (line.length !== 0) {
                if (RE_COMMA.test(line)) {
                    // Comma (use last parsed token)
                    tokens.push(token);
                    token = null;
                } else if (RE_CRLF.test(line)) {
                    // End of line (use last parsed token)
                    if (token !== null) { tokens.push(token); }
                    token = null;
                } else if (/^\s+/.test(line)) {
                    // Skip white spaces
                } else if (RE_DQ_STRING.test(line)) {
                    // Double quoted strings
                    token = RegExp.lastMatch;
                    token = unescape(token.substring(1, token.length-1));
                    RE_DQ_STRING.test(line);
                } else if (RE_CHARS.test(line)) {
                    // A character stream
                    token = RegExp.lastMatch;
                } else {
                    var error = {
                        message: "Unknown character '" + line.charAt(0) + "'",
                        line: lineNo
                    };
                    throw error;
                }
                line = RegExp.rightContext;
            }

            if (tokens.length !== 0) {
                result.push({ line: lineNo, tokens: tokens });
            }
        }

        return result;
    };
})();

/**
 * 'Core' module combines 'Utils' and 'Core' namespace.
 *
 * @module Popcorn.Core
 */

/**
 * Root Popcorn namespace.
 *
 * @namespace Popcorn
 * @author Adam Smyczek
 */
var Popcorn = Popcorn || {};

// --------------------------------------------------------------------------

/**
 * 'Utils' namespace contains helper functions used by all Popcorn modules.
 *
 * @namespace Popcorn.Utils
 * @author Adam Smyczek
 */
Popcorn.Utils = function () {

  var lib = {};

  /**
   * Applies function 'f' on all elements of array 'as'. <br/>
   * <code>map(f, as) => [f(as[i])]</code>
   *
   * @function {any[]} map
   * @param {function} f - function.
   * @param {any[]} as - input array.
   */
  var map = lib.map = function(f, as) {
    var ar = lib.arrayOf(as),
        l  = as.length,
        r  = [];
    for (var i = 0; i < l; i++) {
      r[i] = f(ar[i]);
    }
    return r;
  };

  var O = function() {};
  /**
   * Creates a new object with the argument objects as prototype.
   *
   * @function {object} clone
   * @param {object} o - the object to clone.
   */
  var clone = lib.clone = function(o) {
    O.prototype = o;
    return new O();
  };

  /**
   * Merges argument objects together.
   * This function copies all attributes of all argument
   * objects into one. Use with care, name conflicts are
   * not handled, attributes can be overwritten.
   *
   * @function {object} merge
   * @param {object+} os - one ore more objects to merge.
   */
  var merge = lib.merge = function() {
    var args = lib.args2array(arguments), r = {}, arg;
    for (var i = 0, l = args.length; i < l; i++) {
      arg = args[i];
      for (var name in arg) {
        if (arg.hasOwnProperty(name)) {
          r[name] = arg[name];
        }
      }
    }
    return r;
  };

  /**
   * Converts JavaScript function arguments to an array. <br/>
   * For example:
   * <pre>
   *   function() {
   *     var args = args2array(arguments);
   *     <i>...</i>
   *   }
   * </pre>
   *
   * @function {any[]} args2array
   * @param {arguments} args - the JavaScript function 'arguments'.
   */
  var args2array = lib.args2array = function(args) {
    return Array.prototype.slice.apply(args);
  };

  /**
   * Function arguments parser for 'range' functions. <br/>
   * A 'range' function performs operations on an input
   * range between a min and max integer value.
   * A 'range' function takes no arguments, or one or two
   * integer arguments. Bases on arguments the function is
   * called with and the provided default 'min' and 'max'
   * values, 'args2rage' returns the following range array:
   * <ul>
   *   <li>no args  -> [min, max]</li>
   *   <li>one arg  -> [min, arg one]</li>
   *   <li>two args -> [arg one, arg two]</li>
   * </ul>
   * For example:
   * <pre>
   *   function() {
   *     var min_max = args2range(arguments);
   *     <i>...</i>
   *   }
   * </pre>
   * @see Popcorn.Common.range for an example range function.
   *
   * @function {any[]} args2range
   * @param {arguments} args - the JavaScript function 'arguments'.
   * @param {integer} min - range min value used when no arguments are passed to the range function.
   * @param {integer} max - range max value used when no or one argument is passed to the range function.
   */
  var args2range = lib.args2range = function(args, min, max) {
    var a0 = min, a1 = max, as = args2array(args);
    switch(as.length) {
      case 1 : a1 = lib.intOf(as[0]);
               break;
      case 2 : a0 = lib.intOf(as[0]);
               a1 = lib.intOf(as[1]);
               break;
    }
    return [Math.min(a0, a1), Math.max(a0, a1)];
  };

  /**
   * 'typeOf' extends JavaScript 'typeof' operator with
   * support for 'null', 'undefined', 'array' and
   * 'date' types.
   * See '<a target="_blank" href="http://javascript.crockford.com/remedial.html">Remedial JavaScript</a>'
   * for more details.
   *
   * @function {string} typeOf
   * @param {any} inp - any variable, object etc.
   * @return a string representation of the type, for example 'null', 'array', 'data'.
   */
  var typeOf = lib.typeOf = function(inp) {
    if (inp === null) { return 'null'; }
    if (inp === undefined) { return 'undefined'; }

    var ot = typeof(inp);
    if (ot !== 'object') { return ot; }
    if ((typeof(inp.length) === 'number') &&
      !(inp.propertyIsEnumerable('length')) &&
      (typeof(inp.splice) === 'function')) {
        return 'array';
      }
    if (!isNaN (new Date(inp).getDate())) {
      return 'date';
    }
    return 'object';
  };

  /**
   * @function {boolean} isNull
   * @param {any} inp - any variable, object etc.
   * @return true if the input is null.
   */
  var isNull = lib.isNull = function(inp) {
    return typeOf(inp) === 'null';
  };

  /**
   * @function {boolean} isUndefined
   * @param {any} inp - any variable, object etc.
   * @return true if the input is undefined.
   */
  var isUndefined = lib.isUndefined = function(inp) {
    return typeOf(inp) === 'undefined';
  };

  /**
   * @function {boolean} isString
   * @param {any} inp - any variable, object etc.
   * @return true if the input is a string.
   */
  var isString = lib.isString = function(inp) {
    return typeOf(inp) === 'string';
  };

  /**
   * @function {boolean} isNumber
   * @param {any} inp - any variable, object etc.
   * @return true if the input is a number.
   */
  var isNumber = lib.isNumber = function(inp) {
    return typeOf(inp) === 'number';
  };

  /**
   * @function {boolean} isInt
   * @param {any} inp - any variable, object etc.
   * @return true if the input is an int.
   */
  var isInt = lib.isInt = function(inp) {
    try {
      var i = lib.numberOf(inp);
      return Math.floor(i) === i;
    } catch(e) {
      return false;
    }
  };

  /**
   * @function {boolean} isFunction
   * @param {any} inp - any variable, object etc.
   * @return true if the input is a function.
   */
  var isFunction = lib.isFunction = function(inp) {
    return typeOf(inp) === 'function';
  };

  /**
   * @function {boolean} isArray
   * @param {any} inp - any variable, object etc.
   * @return true if the input is an array.
   */
  var isArray = lib.isArray = function(inp) {
    return typeOf(inp) === 'array';
  };

  /**
   * @function {boolean} isDate
   * @param {any} inp - any variable, object etc.
   * @return true if the input is a date object.
   */
  var isDate = lib.isDate = function(inp) {
    return typeOf(inp) === 'date';
  };

  /**
   * @function {boolean} isObject
   * @param {any} inp - any variable, object etc.
   * @return true if the input is an object (not an array of function).
   */
  var isObject = lib.isObject = function(inp) {
    return typeOf(inp) === 'object';
  };

  /**
   * @function {string} stringOf
   * @param {any} inp - any variable, object etc.
   * @return the input object if it is a string and throws an exception otherwise.
   * @throws an exception if input is not a string.
   */
  var stringOf = lib.stringOf = function(inp) {
    if (!isString(inp)) {
      throw "Invalid input '" + inp + "', expecting a String!";
    }
    return inp;
  };

  /**
   * @function {number} numberOf
   * @param {any} inp - any variable, object etc.
   * @return the input object if it is a number and throws an exception otherwise.
   * @throws an exception if input is not a number.
   */
  var numberOf = lib.numberOf = function(inp) {
    if (!isNumber(inp)) {
      throw "Invalid input '" + inp + "', expecting a Number!";
    }
    return inp;
  };

  /**
   * 'intOf' truncates the input to an int if the input object is a number.
   * An exception is thrown when the input is not a number.
   *
   * @function {integer} intOf
   * @param {any} inp - any variable, object etc.
   * @return the input object if it is an int and throws an exception otherwise.
   * @throws an exception if input is not an int.
   */
  var intOf = lib.intOf = function(inp) {
    try {
      return Math.floor(numberOf(inp));
    } catch(e) {
      throw "Invalid input '" + inp + "', expecting an Integer!";
    }
  };

  /**
   * @function {function} functionOf
   * @param {any} inp - any variable, object etc.
   * @return the input object if it is a function and throws an exception otherwise.
   * @throws an exception if input is not a function.
   */
  var functionOf = lib.functionOf = function(inp) {
    if (!isFunction(inp)) {
      throw "Invalid input '" + inp + "', expecting a Function!";
    }
    return inp;
  };

  /**
   * @function {date} dateOf
   * @param {any} inp - any variable, object etc.
   * @return the input object if it is a date object or a date string.
   * @throws an exception if input is not a date object.
   */
  var dateOf = lib.dateOf = function(inp) {
    var d = (isString(inp))? new Date(Date.parse(inp)) : inp;
    if (!isDate(d)) {
      throw "Invalid input '" + inp + "', expecting an Date object or parsable date string!";
    }
    return d;
  };

  /**
   * @function {any[]} arrayOf
   * @param {any} inp - any variable, object etc.
   * @return the input object if it is an array and throws an exception otherwise.
   * @throws an exception if input is not an array.
   */
  var arrayOf = lib.arrayOf = function(inp) {
    if (!isArray(inp)) {
      throw "Invalid input '" + inp + "', expecting an Array!";
    }
    return inp;
  };

  return lib;

}();

// --------------------------------------------------------------------------

/**
 * 'Core' namespace defines the basic generators for JavaScript primitive types
 * and objects. <br/>
 * The generator library is build on top of the monadic combinators
 * 'return' and 'bind' called 'gen' and 'chain'. However for
 * better performance most internal generators have imperative implementations.<br/>
 *
 * @namespace Popcorn.Core
 * @author Adam Smyczek
 */
Popcorn.Core = function (utils) {

  // This package object extends utils.
  var lib = utils.clone(utils);

  // Object Generation mode
  var MODE_PERMUTATE = 'mode_permutate';
  var MODE_CIRCULATE = 'mode_circulate';

  // ------ Basic operators ------

  /**
   * Identity
   *
   * @function {any} id
   * @param {any} value - any value
   * @return the value
   */
  var id = lib.id = function (v) {
    return v;
  };

  /**
   * 'gen' creates a generator that returns the argument value 'v'
   * when executed on any input object. 'gen' is basically a generator
   * constructor that wraps any value into a generator.<br/>
   * For example:
   * <pre>
   *   var g = gen('test');
   *   g('any input') will return 'test'.
   * </pre>
   *
   * @function {generator} gen
   * @param {any} inp - any variable, object etc.
   * @return a {@link generator} which executed returns the value 'v'.
   */
  var gen = lib.gen = function(v) {
    return function (_, s) { return { result: v, state: s }; };
  };

  /**
   * Use 'chain' to execute generators in sequence. 'chain'
   * executes the argument generator or generator array 'g'
   * and passes the result to the parameter function 'f'.
   * 'f' may evaluate the result but always has to return
   * a new generator. 'chain' itself is a generator that can
   * be evaluated or passed to another chain or other
   * generator function.<br/>
   * For example:
   * <pre>
   *   var g = chain(gen(1), function(r) { return gen(r + 1); });
   *   g('any input') will evaluate to 2.
   * </pre>
   *
   * @function {generator} chain
   * @paramset
   * @param {generator} g - a {@link generator}
   * @param {function} f - a function that takes the result of the generator
   * 'g' and returns a new generator as result.
   *
   * @paramset
   * @param {generator[]} gs - {@link generator} array
   * @param {function} f - a function that takes the array result
   *   of all generators 'gs' and returns a new generator as result.
   *
   * @return the 'chain' generator.
   */
  var chain = lib.chain = function(g, f) {
    return function(o, s) {
      var r, a;
      if (utils.isArray(g)) {
        r = lib.seq(g, lib.cConcat)(o, s);
        return f(r.result)(o, r.state);
      } else {
        r = g(o, s);
        a = f(r.result);
        return (utils.isArray(a))? lib.seq(a, lib.cConcat)(o, r.state) : a(o, r.state);
      }
    };
  };

  /**
   * 'seq' executes the generators 'gs' and combines the result using
   * {@link combinator} function 'f'. Combinator 'f' is called on every
   * step with the result of previous executions ('init' value on first call)
   * and the result of the current generator evaluation. <br/>
   * For example:
   * <pre>
   *   var g = seq([gen('a'), gen('b'), gen('c')], cJoin, 0);
   *   g('any input') will return 'abc'.
   * </pre>
   *
   * @function {generator} seq
   * @param {generator[]} gs - {@link generator} array.
   * @param {combinator} f - {@link combinator} function.
   * @param {any} init - the initial value passed on first call to the {@link combinator}.
   *
   * @see Popcorn.Core.cConcat
   * @see Popcorn.Core.cJoin
   *
   * @return the sequence generator that evaluates the generators 'gs' when executed.
   */
  var seq = lib.seq = function(gs, f, init) {
    return function(o, s) {
      if (gs.length > 0) {
        var r = init, ns = s, ir;
        for (var i = 0, l = gs.length; i < l; i++) {
          ir = gs[i](o, ns);
          r = f(r, ir.result, i);
          ns = ir.state;
        }
        return { result: r, state: ns };
      }
      return { result: o, state: s };
    };
  };

  /**
   * Repeats value 'v' 'n'-times and returns the resulting array.
   * If parameter 'v' is an array, the subsequent results are concatenated.
   * 'repeat' is commonly used with object generators, for example:
   * <pre>
   *   var gen = {
   *     name : repeat(3, gen('abc'))
   *   }
   *   will generate three objects { name : 'abc' } when evaluated with {@link generate}.
   * </pre>
   * See {@link Popcorn.Core.generate} for details.
   *
   * @function {any[]} repeat
   * @param {integer} n - repeat count.
   * @param {any} v - object or generator to repeat.
   */
  var repeat = lib.repeat = function(n, v) {
    var c  = Math.max(1, utils.intOf(n)),
        vs = [];

    if (utils.isArray(v)) {
      while (c--) { vs.push.apply(vs, v); }
    } else if (utils.isFunction(v)) {
      while (c--) { vs.push(v); }
    } else {
      while (c--) { vs.push(gen(v)); }
    }
    return vs;
  };

  /**
   * 'replicate' executes generator 'g' 'n'-times and combines
   * the results using {@link combinator} function 'f'.
   * This function is a specialization of {@link seq}. <br/>
   * Example:
   * <pre>
   *   var overflow = replicate(gen('A'), cJoin, '');
   *   overflow(5) generates 'AAAAA'
   * </pre>
   *
   * @function {generator} replicate
   * @param {generator} g - a {@link generator}.
   * @param {combinator} f - {@link combinator} function.
   * @param {any} init - the initial value for the {@link combinator} function 'f'.
   * @see Popcorn.Core.seq
   * @return the replicator generator
   */
  var replicate = lib.replicate = function(g, f, init) {
    return function(n) {
      var c  = Math.max(1, utils.intOf(n)),
          gs = [];
      for (var i = 0; i < c; i++) { gs[i] = g; }
      return seq(gs, f, init);
    };
  };

  /**
   * 'cConcat' {@link combinator} function concatenates the results
   * of generators executed in sequence into one array. <br/>
   * For example:
   * <pre>
   *   seq([gen(1), gen(2)], cConcat)() => [1,2]
   * </pre>
   * 'cConcat' can be used in combination with {@link seq] and {@link replicate}.
   *
   * @function {any} cConcat
   * @param {any} r - combined result of previous executions.
   * @param {any} n - result of current generator evaluation.
   */
  var cConcat = lib.cConcat = function(r, n) { return (r || []).concat(n); };

  /**
   * 'cJoin' combinator function joins the results of generators
   * executed in sequence into one string. <br/>
   * For example:
   * <pre>
   *   seq([gen(1), gen(2)], cJoin)() => '12'
   * </pre>
   * 'cJoin' can be used in combination with {@link seq] and {@link replicate}.
   *
   * @function {any} cJoin
   * @param {any} r - combined result of previous executions.
   * @param {any} n - result of current generator evaluation.
   */
  var cJoin = lib.cJoin = function(r, n) { return (r || '') + n; };

  // ------ Handling objects ------

  /**
   * 'property' applies generator 'g' on an object property of name
   * 'name' and returns the resulting object. 'property' acts as a
   * property selector and is a generator itself that can be
   * evaluated or passed to other generators. <br/>
   * For example:
   * <pre>
   *   var o    = { name:'Woody', toy:'cowboy' };
   *   var name = property('name');
   *   name(gen('Buzz'))(o) will return the object { name:'Buzz', toy:'cowboy' }
   * </pre>
   *
   * @function {generator} property
   * @param {string} name - object property name.
   */
  var property = lib.property = function(name) {
    return function(g) {
      return function(o, s) {
        var r = g(o[name]);
        o[name] = r.result;
        return { result: o, state: r.state };
      };
    };
  };

  /**
   * Executes generators 'gs' on an input object
   * and returns the updated object. <br/>
   * For example:
   * <pre>
   *   var o    = { name: 'Woody', toy: 'cowboy' };
   *   var name = property('name');
   *   var toy  = property('toy');
   *   update([name(gen('Buzz')), toy(gen('action figure'))])(o) will return the object
   *   { name:'Buzz', toy:'action figure' }
   * </pre>
   *
   * @function {generator} update
   * @param {generator[]} gs - {@link generator} array.
   */
  var update = lib.update = function(gs) {
    return seq(gs, function(r, n) { return r || n; });
  };

  /**
   * 'mutate' executes generators 'gs' on the input object o.
   * For example:
   * <pre>
   *   mutate([gen('Buzz'), gen('Woody')](o) will return
   *   ['Buzz', 'Woody']
   * </pre>
   * @function {generator} mutate
   * @param {generator[]} gs - {@link generator} array.
   */
  var mutate = lib.mutate = function(gs) {
    return function(o, s) {
      if (gs.length > 0) {
        var r = [], ns = s, ogr;
        for(var i = 0, l = gs.length; i < l; i++) {
          var gr = gs[i](o, ns);
          ns = gr.state;

          // Mutate on an array
          if (utils.isArray(gr.result)) {
            for (var j = 0, jl = gr.result.length; j < jl; j++) {
              r.push(gr.result[j]);
            }

          // Mutate on a group generator
          } else if (utils.isObject(gr.result) && (gr.result._array_result === true)) {
            ogr = (utils.isArray(gr.result._generator))?
                  seq(gr.result._generator, cConcat)(o, ns) :
                  gr.result._generator(o, ns);
            ns = ogr.state;
            r.push((gr.result._join_result === true)? ogr.result : ogr.result.join());

          // Mutate on an inner-object
          // TODO currently supported for permutation only
          } else if (utils.isObject(gr.result)) {
            if (MODE_PERMUTATE === ns._generation_mode) {
              ogr = lib.permutate(gr.result, o, -1, ns, id);
              ns = ogr.state;
              for (var k = 0, kl = ogr.result.length; k < kl; k++) {
                r.push(ogr.result[k]);
              }
            } else {
                r.push(gr.result);
            }

          // All other values
          } else {
            r.push(gr.result);
          }
        }
        return { result: r, state: ns };
      }
      return { result: [o], state: s };
    };
  };

  // New object constructor function used for object
  // 'mutateOnAttribute' and 'permutate' functions.
  var O = function() {};

  /**
   * 'mutateOnAttribute' executes generators 'gs' on an object property
   * of name 'name'. The result is an array that contains
   * one result object for every generator result value.<br/>
   * For example:
   * <pre>
   *   var o = { name: 'Woody', age:2 };
   *   mutateOnAttribute('name', [gen('Buzz'), gen('Woody')](o) will return
   *   the object array [{ name:'Buzz', age:2 }, { name:'Woody', age:2 }]
   * </pre>
   *
   * @function {generator} mutateOnAttribute
   * @param {string} name - object property name.
   * @param {generator[]} gs - {@link generator} array.
   */
  var mutateOnAttribute = function(name, gs) {
    return function(o, s) {
      if (gs.length > 0) {
        var gr = mutate(gs)(o[name], s),
            rs = gr.result,
            r = [], n;
        for (var j = 0, jl = rs.length; j < jl; j++) {
          O.prototype = o;
          n = new O();
          n[name] = rs[j];
          r.push(n);
        }
        return { result: r, state: gr.state };
      }
      return { result: [o], state: s };
    };
  };

  /**
   * Wrappes a value into generator array,
   * the default input for 'mutate'.
   *
   * @function {generator[]} toGenArray
   * @param {value/generator/[generator]} value
   */
  var toGenArray = function(v) {
    if (utils.isArray(v)) {
      return v;
    } else if (utils.isFunction(v)) {
      return [v];
    } else {
      return [gen(v)];
    }
  };

  // ------ JSON object generation functions ------

  /**
   * 'permutate' is one of two supported JSON object
   * generation functions. It executes the argument
   * generator 'gen' on the default object 'base'
   * and returns the resulting object array.<br/>
   * This generation method permutates over all results
   * of all attribute generator, for example:
   * <pre>
   *   var base = { name: 'Woody', age:2 };
   *   var gen  = { name: list('Buzz', 'Slinky'), age: range(2,4) };
   *   generate(gen, base) will return the array:
   *    [{ name: 'Buzz',   age: 2 },
   *     { name: 'Buzz',   age: 3 },
   *     { name: 'Buzz',   age: 4 },
   *     { name: 'Slinky', age: 2 },
   *     { name: 'Slinky', age: 3 },
   *     { name: 'Slinky', age: 4 }]
   * </pre>
   *
   * @function {object[]} permutate
   * @param {object} gen - the generator object.
   * @param {object} base - the base test case object.
   * @param {int} count - an optional result count
   * @param {object} state - an optional state object that
   *    can be read and manipulated by any generator.
   * @param {function} result_transformer - an optional function
   *   which takes the result generator object { result:r, state:s }
   *   as argument and returns the desired result. If not defined,
   *   the default transformer returns just the result array.
   *   To return the result and state use 'id' function.
   */
  var permutate = lib.permutate = function(generator, base, count, state, result_transformer) {
    var st = state || {};
    var c  = count || -1;
    var rt = result_transformer || function(r) { return r.result; };
    var gs = [], rs = [], r;
    st._generation_mode = MODE_PERMUTATE;

    // Recursive permutate helper applies
    // generator 'g' on all objects 'os'.
    var perm_rec = function(g, os, s) {
      var rs = [], rr, ns = s, r, o;
      for (var i = 0, l = os.length; i < l; i++) {
        O.prototype = os[i];
        o = new O();
        ns._result_object = o;
        r = g(o, ns);
        ns = r.state;
        rs.push.apply(rs, r.result);
      }
      return { result: rs, state: ns };
    };

    // Permutate generator
    var perm_gen = function(o, s) {
      if (gs.length > 0) {
        var rs = [o], ns = s, r;
        for (var i = 0, l = gs.length; i < l; i++) {
          r = perm_rec(gs[i], rs, ns);
          ns = r.state;
          rs = r.result;
        }
        return { result: rs, state: ns };
      }
      return { result: [o], state: s };
    };

    // Generation
    for (var name in generator) {
      if (generator.hasOwnProperty(name)) {
        gs.push(mutateOnAttribute(name, toGenArray(generator[name])));
      }
    }

    // TODO: move count logic into the permutate generator
    // XXX: state does not match the result of the last run
    //      if n x run > count !!!
    var done = false;
    while(!done) {
      r = perm_gen(base, st);
      rs = rs.concat(r.result);
      st = r.state;
      if (c < 0) {
        done = true;
      } else if (rs.length > c) {
        rs = rs.slice(0, c);
        done = true;
      }
    }

    return rt({ result : rs, state : st });
  };

  /**
   * Same as 'permutate', 'circulate' executes the argument
   * generator 'gen' on the default object 'base'
   * and returns the resulting object array.<br/>
   * In difference to 'permutate', the results of all
   * attribute generators are combined together.
   * If no count is provided, circulate generates object array
   * of the length of the longest attribute generator.
   * All other attribute values circulate, for example:
   * <pre>
   *   var base = { name: 'Woody', age:2 };
   *   var gen  = { name: list('Buzz', 'Slinky'), age: range(2,5) };
   *   generate(gen, base) will return the array:
   *    [{ name: 'Buzz',   age: 2 },
   *     { name: 'Slinky', age: 3 },
   *     { name: 'Buzz',   age: 4 },
   *     { name: 'Slinky', age: 5 }]
   * </pre>
   *
   * @function {object[]} circulate
   * @param {object} gen - the generator object.
   * @param {object} base - the base test case object.
   * @param {int} count - an optional result count
   * @param {object} state - an optional state object that
   *    can be read and manipulated by any generator.
   * @param {function} result_transformer - an optional function
   *   which takes the result generator object { result:r, state:s }
   *   as argument and returns the desired result. If not defined,
   *   the default transformer returns just the result array.
   *   To return the result and state use 'id' function.
   */
  var circulate = lib.circulate = function(generator, base, count, state, result_transformer) {
    var s = state || {};
    var c = count || -1;
    var rt = result_transformer || function(r) { return r.result; };
    s._generation_mode = MODE_CIRCULATE;
    s._result_object = base;

    var gs = {}, gr = {}, r, o, max = 1, rs = [], name;

    // Initialize
    for (name in generator) {
      if (generator.hasOwnProperty(name)) {
        gs[name] = mutate(toGenArray(generator[name]));
        r = gs[name](base[name], s);
        if (r.result.length > max) { max = r.result.length; }
        gr[name] = [];
      }
    }

    // Generate
    max = (c < 0)? max : c;
    while(max > 0) {
      max--;
      O.prototype = base;
      o = new O();
      s._result_object = o;
      for (name in generator) {
        if (generator.hasOwnProperty(name)) {
          if (gr[name].length === 0) {
            r = gs[name](base[name], s);
            gr[name] = r.result;
            s = r.state;
          }
          o[name] = gr[name].shift();
        }
      }
      rs.push(o);
    }

    return rt({ result : rs, state : s });
  };

  /**
   * 'current' provides access to current generated object.
   * It's experimental, use with care!!!
   * For example:
   * <pre>
   *   var o = { name: 'Woody', age:2 };
   *   var g = { name : list('Buzz', 'Woody'),
   *             description : current(function(r) { return r.name + ' is ' + r.age; }) }
   *   permutate(g, o) will return
   *   [{ name:'Buzz', age:2, description: 'Buzz is 2' },
   *    { name:'Woody', age:2, description: 'Woody is 2' }]
   * </pre>
   *
   * @function {generator} current
   * @param {function} f - a callback function that takes the current
   *                       generated objects as parameter and returns
   *                       this attribute value.
   */
  var current = lib.current = function(f) {
    return function(o, s) {
      return { result : f(s._result_object), state : s };
    };
  };

  /**
   * Equivalent to 'permutate'.
   * @Deprecated
   */
  var generate = lib.generate = function(generator, base, state, result_transformer) {
    return permutate(generator, base, -1, state, result_transformer);
  };

  // ------ State and variables ------

  /**
   * 'setVar' stores the result of one generator that can be used
   * as input to another generator in same generation process. <br/>
   * For example:
   *
   * <pre>
   *   var g = {
   *     int   : setVar('my_rand', random().int()),
   *     plus1 : withVar('my_rand', function(i) { return gen(i + 1); })
   *   }
   * </pre>
   *
   * The random integer value generated for attribute 'int' is stored
   * in the state object under the attribute name 'my_rand' and referenced
   * using {@link withVar} function.
   *
   * @function {generator} setVar
   * @param {string} name - variable name the generator value is stored for.
   * @param {generator} g - the generator to execute.
   * @return result of the generator 'g'.
   */
  var setVar = lib.setVar  = function(name, g) {
    return function(o, s) {
      var r = g(o, s);
      r.state[name] = r.result;
      return gen(r.result)(o, r.state);
    };
  };

  /**
   * 'withVar' provides access to variables stored using {@link setVar}
   * generator. It takes the variable name and a function as argument.
   * The value of the variable is passed to the function that has
   * to return another generator as result.
   * For an example see {@link setVar} generator.
   *
   * @function {generator} withVar
   * @param {string} name - variable name.
   * @param {function} f - takes the variable as argument and returns
   *     a new generator as result.
   */
  var withVar = lib.withVar = function(name, f) {
    return function (o, s) {
      return f(s[name])(o, s);
    };
  };

  /**
   * Creates a generator that returns the value of the
   * variable 'name' when executed. For example:
   *
   * <pre>
   *   var g = {
   *     att1 : setVar('my_rand', random().int()),
   *     att2 : varGen('my_rand')
   *   }
   * </pre>
   * will generate an object with same value for
   * both attributes.
   *
   * @function {generator} varGen
   * @param {string} name - variable name.
   */
  var varGen = lib.varGen = function(name) {
    return function (o, s) {
      return gen(s[name])(o, s);
    };
  };

  /**
   * 'withState' provides access to the state object.
   * The function 'f' takes the state object as argument
   * and returns another generator as result. All modifications
   * to the state object are visible to other generators.
   * For example:
   *
   * <pre>
   *   var g = {
   *     int : withState(function(s) { s.init = 10; return random().int(); } ),
   *     add : withState(function(s) { return gen(s.init + 10); } )
   *   }
   * </pre>
   *
   * @function {generator} withState
   * @param {function} f - takes the state object as argument and
   *    returns a new generator as result.
   */
  var withState = lib.withState = function(f) {
    return function (o, s) {
      return f(s)(o, s);
    };
  };

  /**
   * Group generator results into array
   *
   * @function {generator} array
   * @param {function} g - the generator to wrap
   */
  // A work-around for not supporting seq-monad yet!
  var array = lib.array = function(g) {
      return gen({ _array_result : true, _generator : g });
  };

  // ------ Core random generators ------

  /**
   * Creates a linear congruential random generator object using an optional
   * 'seed' value. If 'seed' is not defined, the default JavaScript Math.random()
   * function is used. See Wikipedia
   * <a href="http://en.wikipedia.org/wiki/Linear_congruential_generator">LCR</a>
   * for details.
   *
   * @function {random} random
   * @param {integer} seed - an optional seed.
   * @return the random generator object.
   */
  var random = lib.random = function(seed) {
    var m = 4294967296, // 2^32
        a = 1103515245, // glibc conform multiplier
        c = 12345,      // and increment
        s = seed || Math.floor(Math.random() * m),
        x = s % m;

    // Moves to the next pseudo-random value in the sequence
    // and generates next int in the range from min to max.
    var nextInt = function(min, max) {
        x = (a * x + c) % m;
        return Math.floor(min + x/m * (max - min));
    };

    /**
     * Random generator object.
     * This object implements all {@link Popcorn.Core.RandomLib}
     * generator functions.
     *
     * @object Popcorn.Core.Random
     */
    var rand = utils.clone(lib.RandomLib);

    /**
     * A random integer generator. 'int' is a rage function
     * that generates a value between min and max, depending
     * on arguments the function is called with.
     *
     * @function {generator} int
     * @paramset No arguments - the generator returns a random value between 0 and 100.
     * @paramset One int argument - the generator returns a random value between 0 and max.
     * @param {integer} max - max value.
     * @paramset Two int argument - the generator returns a random value between min and max.
     * @param {integer} min - from integer
     * @param {integer} max - to integer
     * @return a generator which executed generates a random integer.
     */
    rand.int = function() {
      var mm = utils.args2range(arguments, 0, 1000);
      return lib.lazy(function() { return gen(nextInt(mm[0], mm[1])); });
    };

    /**
     * 'element' picks a random element from provided argument array 'as'.
     *
     * @function {generator} element
     * @param {any[]} as - array
     * @return the element generator which executed returns a random element
     * from argument array 'as'.
     */
    rand.element = function(as) {
      if (as.length > 0) {
        return lib.lazy(function() { return gen(as[nextInt(0, as.length)]); });
      }
      throw "Empty array or string!";
    };

    return rand;
  };

  /**
   * Extensible library class for random generators.
   * 'RandomLib' can be extended by other modules as following:
   * <pre>
   *   core.RandomLib.randomAlpha = function() {...};
   * </pre>
   * Once the module is loaded, 'randomAlpha' is available
   * in the {@link Random} object and can be executed as:
   * <pre>
   *   random().randomAlpha();
   * </pre>
   *
   * @class Popcorn.Core.RandomLib
   * @see Popcorn.Common.alpha
   */
  var RandomLib = lib.RandomLib = {};

  // ------ Other generator functions ------

  /** @scope Popcorn.Core */

  /**
   * Lazy generator evaluation wrapper
   * used for example by random generators. <br/>
   * For example:
   * <pre>
   *   var g1 = gen(Math.random());
   *   var g2 = lazy(function() { return gen(Math.random()); });
   *   g1 will always return the same value and g2 a different one
   *   when executed.
   * </pre>
   *
   * @function {generator} lazy
   * @param g - the {@link generator} to wrap.
   */
  var lazy = lib.lazy = function(g) {
    return function(o, s) { return g(o, s)(o, s); };
  };

  /**
   * 'mapGen' is a helper function that
   * converts all elements of an array to
   * generators. <br/>
   * <code>magGen(as) -> [gen(as[i])]</code>
   *
   * @function {generator[]} mapGen
   * @param {any[]} vs - array.
   */
  var mapGen = lib.mapGen = function(vs) {
    return utils.map(gen, vs);
  };

  return lib;

}(Popcorn.Utils);


/**
 * @module Popcorn.Common
 * @requires Popcorn.Core
 */

/**
 * A collection of most common generators.
 *
 * @namespace Popcorn.Common
 * @author Adam Smyczek
 */
Popcorn.Common = function (core) {

  var lib = {};

  // Some internal constants
  var alpha     = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var digit     = '0123456789';
  var alpha_num = alpha + digit;

  /**
   * Concats arguments (primitives single result generators)
   * into one string.
   *
   * @function {generator[string]} concat
   * @param {[generator/primitives]} value - single value
   * generators or primitives to concatenate.
   */
  var concat = lib.concat = function() {
    var args = core.args2array(arguments), gs = [], v;
    for (var i = 0, l = args.length; i < l; i++) {
      v = args[i];
      gs[i] = core.isFunction(v)? v : core.gen(v);
    }
    return core.seq(gs, core.cJoin, "");
  };

  /**
   * 'range' generator creates a list of integer generators
   * in the range from min to max. This is a range function
   * and accepts no arguments, or one or two integer arguments.
   * For example:
   * <pre>
   *   var o = { int : 0 }
   *   var gen = { int : range(1, 3);
   *   generate(gen, o) will return:
   *   [{ int : 1 }, { int : 2 }, { int : 3 }]
   * </pre>
   *
   * @function {generator[int]} range
   * @paramset No arguments - generates a range from 0 to 100.
   * @paramset One int argument - generates a range from 0 to max.
   * @param {integer} max - range max value.
   * @paramset two int arguments - from-to range.
   * @param {integer} min - from integer
   * @param {integer} max - to integer
   *
   * @see Popcorn.Utils.args2range
   */
  var range = lib.range = function() {
    var mm = core.args2range(arguments, 0, 100),
        l  = mm[1] - mm[0],
        r  = [];
    for (var i = 0; i <= l; i++) {
      r[i] = core.gen(mm[0] + i);
    }
    return r;
  };

  /**
   * Converts input arguments into a generator array [gen(arguments[i])]. <br/>
   * For example:
   * <pre>
   *   var o = { name : 'Woody' }
   *   var gen = { name : list('Buzz', 'Slinky');
   *   generate(gen, o) will return:
   *   [{ name : 'Buzz' }, { name : 'Slinky' }]
   * </pre>
   *
   * @function {generator[any]} list
   * @param {any+} args - the values to generate.
   */
  var list = lib.list = function() {
    var args = core.args2array(arguments);
    return function(o, s) {
      var rs = [], r;
      for (var i = 0, l = args.length; i < l; i++) {
        r = args[i];
        if (core.isArray(r)) {
          rs.push.apply(rs, list.apply(this, r)(o, s).result);
        } else {
          rs.push(r);
        }
      }
      return { result: rs, state: s };
    };
    // return core.mapGen(core.args2array(arguments));
  };

  /**
   * Joins arguments together. Generator arguments
   * are evaluated and array arguments join recursive.
   *
   * @function {generator} join
   * @param {any+} args - values, arrays or generators.
   */
  var join = lib.join = function() {
    var args = core.args2array(arguments);
    return function(o, s) {
      var rs = "", ns = s, gr, r;
      for (var i = 0, l = args.length; i < l; i++) {
        r = args[i];
        switch(core.typeOf(r)) {
          case 'function' :
            gr = r(o, s);
            rs += gr.result;
            ns = gr.state;
            break;
          case 'array' :
            gr = join.apply(this, r)(o, s);
            rs += gr.result;
            ns = gr.state;
            break;
          default:
            rs += r;
            break;
        }
      }
      return { result: rs, state: ns };
    };
  };

  // ------ Prepend/append generators ------

  // Internal prepend/append function prepends/appends
  // to default value based on handler function.
  var pre_a_pend = function(h) {
    return function(g, v) {
      return function(o, s) {
        var pv = v || o;
        switch (core.typeOf(g)) {
          case 'array'    :
            var rs = [], ns = s, r;
            for (var i = 0, l = g.length; i < l; i++) {
              r = pre_a_pend(h)(g[i], v)(pv, ns);
              rs.push.call(rs, r.result);
              ns = r.state;
            }
            return { result: rs, state: ns };
          case 'function' :
            return core.chain(g, function(r) { return core.gen(h(r, pv)); })(pv, s);
          default         :
            return { result: h(g, pv), state: s };
        }
      };
    };
  };

  /**
   * Prepends a value to the attribute value of the base object.
   * Prepend takes a value, an array or a generator as argument. <br/>
   * For example:
   * <pre>
   *   var o = { name : 'Head' }
   *   generate({ name : prepend('Mr. Potato ') }, o) will generate:
   *   [{ name : 'Mr. Potato Head' }]
   * </pre>
   *
   * @function {generator} prepend
   * @paramset Value
   * @param {any} inp - the value to prepend.
   * @paramset Array
   * @param {any[]} ar - the values to prepend. The resulting array
   *   contains one object for every array element.
   * @paramset generator
   * @param {generator} gen - the generator of which result is prepended
   *   to the base object value.
   */
  var prepend = lib.prepend = pre_a_pend(function(a, b) { return a + b; });

  /**
   * Appends a value to the attribute value of the base object.
   * See {@link prepend} for details.
   *
   * @function {generator} append
   * @paramset Value
   * @param {any} inp - the value to append.
   * @paramset Array
   * @param {any[]} ar - the values to append. The resulting array
   *   contains one object for every array element.
   * @paramset generator
   * @param {generator} gen - the generator of which result is appended
   *   to the base object value.
   */
  var append  = lib.append  = pre_a_pend(function(a, b) { return b + a; });

  // ------ Random generators extensions ------

  // Internal string generator builder.
  // Creates a generator for an argument char set,
  // see alpha and alphaNum.
  var randomString = function(char_set) {
    return function() {
      var mm      = core.args2range(arguments, 1, 100),
          int     = this.int(mm[0], mm[1]),
          element = this.element(char_set);
      return core.lazy(function(o, s) {
        var l = int().result, r = "";
        for (var i = 0; i < l; i++) {
          r += element().result;
        }
        return core.gen(r);
      });
    };
  };

  /** @scope Popcorn.Core.Random */

  /**
   * The range function 'alpha' generates a random alpha string.
   * The length of the string depends on the arguments this
   * function is called with.
   *
   * @function {generator} alpha
   * @paramset No arguments - generates an alpha string of length between 0 and 100.
   * @paramset One int argument - generates an alpha string of length between 0 and 'max'.
   * @param {integer} max - max string length.
   * @paramset two int arguments - length range.
   * @param {integer} min - min length
   * @param {integer} max - max length
   *
   * @see Popcorn.Utils.args2range
   */
  core.RandomLib.alpha    = randomString(alpha);

  /**
   * Same as {@link alpha} but generates an alpha numeric string.
   *
   * @function {generator} alphaNum
   * @paramset No arguments - generates an alphaNum string of length between 0 and 100.
   * @paramset One int argument - generates an alphaNum string of length between 0 and 'max'.
   * @param {integer} max - max string length.
   * @paramset two int arguments - length range.
   * @param {integer} min - min length
   * @param {integer} max - max length
   *
   * @see Popcorn.Utils.args2range
   */
  core.RandomLib.alphaNum = randomString(alpha_num);

  /** @scope Popcorn.Common */

  /**
   * Date generator.
   *
   * @function {generator} date
   * @param {date} d - the JavaScript date object or a date string representation, for example 'Sep. 13 2009'.
   * @param {string} format - the output format, possible values are: date, hours, minutes, seconds, time, gmt.
   * By default date generates the local time string.
   */
  var date = lib.date = function(d, format) {
    var cdate = core.dateOf(d);
    switch(format) {
      case 'date'   : return core.gen(cdate.getDate());
      case 'hours'  : return core.gen(cdate.getHours());
      case 'minutes': return core.gen(cdate.getMinutes());
      case 'seconds': return core.gen(cdate.getSeconds());
      case 'time'   : return core.gen(cdate.getTime());
      case 'gmt'    : return core.gen(cdate.toString());
      case 'utc'	: return core.gen ([cdate.getUTCFullYear (),"-",cdate.getUTCMonth(),"-",cdate.getUTCDate(),"T",cdate.getUTCHours (),":", cdate.getUTCMinutes(),":", cdate.getUTCSeconds (), ".",cdate.getUTCMilliseconds(),"Z"].join (""));
      default       : return core.gen(cdate.toLocaleString());
    }
  };

  /**
   * A convenience function that creates a generator for current date/time.
   *
   * @function {generator} now
   * @param {string} format - the output format, possible values are: date, hours, minutes, seconds, time, gmt.
   * By default data prints the local time string.
   * @see Popcorn.Common.date
   */
  var now = lib.now = function(format) {
    return date(new Date(), format);
  };

  /**
   * Generates a random date
   *
   * @function {generator} date
   * @param {milisec} from - from date
   * @param {milisec} to   - to date
   * @param {string} format - the output format, possible values are: date, hours, minutes, seconds, time, gmt.
   * By default data prints the local time string.
   *
   * @see Popcorn.Common.date
   */
  core.RandomLib.date = function(from, to, format) {
    var f = from || new Date(0),
        t = to   || new Date(99999999999999),
        r = this;
    return core.lazy(function() { return lib.date(new Date(r.int(f.getTime(), t.getTime())().result), format); });
  };

  return lib;

}(Popcorn.Core);


/**
 * @module Popcorn.Dictionary
 * @requires Popcorn.Core
 */

/**
 * Base functions and objects to build dictionaries.
 *
 * @namespace Popcorn.Dictionary
 * @author Adam Smyczek
 * @author Brian Wilkerson
 */
Popcorn.Dictionary = function (core) {

  var lib = {};

  /**
   * Creates a {@link Dict} object for an dictionary array. <br/>
   * For example:
   * <pre>
   *   The pronouns dictionary
   *     var pronoun = dictionary(['I', 'you', 'he', 'she', 'it']);
   *   provides generators:
   *     pronoun.list(), pronoun.element(), etc.
   * </pre>
   *
   * @function {object} dictionary
   * @param {any[]} dict - a dictionary array.
   * @return a dictionary object.
   */
  var dictionary = lib.dictionary = function(dict) {

    /**
     * A base dictionary object provides common
     * generators for array dictionaries.
     *
     * @object Popcorn.Dictionary.Dict
     */
    return {

      /**
       * Creates a generator to list dictionary elements.
       * By default all dictionary elements are listed. If 'n' > dict.length
       * the resulting elements are repeated in loop.
       * 'list' is a range function that takes no arguments, or
       * one or two integer arguments.
       *
       * @function {generator} list
       * @paramset No arguments - the generator returns the entire dictionary.
       * @paramset One int argument - the generator returns the first n elements.
       * @param {integer} n - element count.
       * @paramset two int arguments - the generator returns elements from n to m
       * @param {integer} n - from list index
       * @param {integer} m - to list index
       *
       * @see Popcorn.Utils.args2range
       */
      list : function() {
               var mm = core.args2range(arguments, 0, dict.length),
                   ar = dict, r = [];
               while (ar.length < mm[1]) {
                 ar.push.apply(ar, dict);
               }
               for (var i = 0, l = mm[1] - mm[0]; i < l; i++) {
                 r[i] = core.gen(ar[mm[0] + i]);
               }
               return r;
             },

      /**
       * 'element' returns one random dictionary element.
       * This generator uses a random generator 'rand' if
       * provided, otherwise creates a new {@link Popcorn.Core.random}
       * generator.
       *
       * @function {generator} element
       * @param {random} rand - a random generator 'random()'.
       *
       * @see Popcorn.Core.random
       */
      element : function(rand) {
                 var r = rand || core.random();
                 return core.lazy(function() { return r.element(dict); });
               },

      /**
       * 'elements' returns n random dictionary element.
       *
       * @function {generator} elements
       * @param {integer} n    - element count to generate
       * @param {random} rand - optional a random generator 'random()'.
       *
       * @see Popcorn.Core.random
       */
      elements : function(n, rand) {
                 var c = n || 5,
                     r = rand || core.random();
                 return core.repeat(c, r.element(dict));
               }

    };

  };

  // ------ Lorem ipsum ------

  var lorem_ipsum = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipisicing', 'elit,',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua.', 'Ut', 'enim', 'ad', 'minim', 'veniam,', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
    'commodo', 'consequat.', 'Duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
    'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
    'pariatur.', 'Excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident,',
    'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
    'est', 'laborum.'];

  /** @scope Popcorn.Dictionary */

  /**
   * Generate a <a target="_blank" href="http://en.wikipedia.org/wiki/Lorem_ipsum">lorem ipsum</a>
   * content of the length 'n'.
   * This function returns the lorem ipsum if 'n' is not defined.
   *
   * @function {generator} loremIpsum
   * @param {integer} n - optional length of the generated lorem ipsum content.
   * @param {integer} m - optional min/max length randomly chosen.
   */
  var loremIpsum = lib.loremIpsum = function(n) {
    var l = n || lorem_ipsum.length;
    return core.gen(lorem_ipsum.slice(0, l).join(" "));
  };

  /**
   * Random length lorem ipsum generator.
   *
   * @function {generator[int]} loremIpsum
   * @paramset No arguments - generates a range from 0 to lorem ipsum length
   * @paramset One int argument - generates a range from 0 to lorem ipsum length.
   * @param {integer} max - range max value.
   * @paramset two int arguments - from-to range.
   * @param {integer} min - from integer
   * @param {integer} max - to integer
   *
   * @see Popcorn.Core.random
   */
  core.RandomLib.loremIpsum = function() {
    var mm  = core.args2range(arguments, 0, lorem_ipsum.length);
    return core.gen(lorem_ipsum.slice(mm[0], mm[0] + this.int(mm[0], mm[1])().result).join(" "));
  };

  return lib;

}(Popcorn.Core);


/**
 * @module Popcorn.Passwords
 * @requires Popcorn.Core
 * @requires Popcorn.Dictionary
 */

/**
 * A common passwords dictionary. <br/>
 * Credits to
 * <a target="_blank" href="http://www.whatsmypass.com/the-top-500-worst-passwords-of-all-time">The top 500 worst passwords of all time</a>.
 *
 * @namespace Popcorn.Passwords
 * @author Brian Wilkerson
 * @author Adam Smyczek
 */
Popcorn.Passwords = function (core, dict) {

  var lib = {};

  var passwords_dict = [
  "1", "123456", "porsche", "firebird", "prince", "rosebud2", "password", "guitar", "butter", "beach", "jaguar3",
    "12345678", "chelsea", "united", "amateur", "great4", "1234", "black", "turtle", "7777777", "cool5", "diamond",
    "steelers", "muffin", "cooper6", "12345", "nascar", "tiffany", "redsox", "13137", "dragon", "jackson", "zxcvbn",
    "star", "scorpio8", "qwerty", "cameron", "tomcat", "testing", "mountain9", "696969", "654321", "golf", "shannon",
    "madison10", "mustang", "computer", "bond007", "murphy", "98765411", "letmein", "amanda", "bear", "frank",
    "brazil12", "baseball", "wizard", "tiger", "hannah", "lauren13", "master", "xxxxxxxx", "doctor", "dave",
    "japan14", "michael", "money", "gateway", "eagle1", "football", "phoenix", "gators", "11111", "squirt16",
    "shadow", "mickey", "angel", "mother", "stars17", "monkey", "bailey", "junior", "nathan", "apple18", "abc123",
    "knight", "thx1138", "raiders", "alexis19", "pass", "iceman", "steve", "aaaa20", "tigers", "badboy", "forever",
    "bonnie21", "6969", "purple", "debbie", "angela", "peaches22", "jordan", "andrea", "spider", "viper", "jasmine23",
    "harley", "melissa", "ou812", "kevin24", "ranger", "dakota", "booger", "jake", "matt25", "iwantu", "aaaaaa",
    "1212", "lovers", "qwertyui26", "jennifer", "player", "flyers", "danielle27", "hunter", "sunshine", "fish",
    "gregory", "morgan", "buddy", "432129", "2000", "starwars", "matrix", "whatever", "412830", "test", "boomer",
    "runner31", "batman", "cowboys", "scooby", "nicholas", "swimming32", "trustno1", "edward", "jason", "lucky",
    "dolphin33", "thomas", "charles", "walter", "helpme", "gordon34", "tigger", "jackie", "casper35", "robert",
    "booboo", "boston", "monica", "stupid36", "access", "coffee", "braves", "midnight", "shit37", "love", "xxxxxx",
    "yankee", "college", "saturn38", "buster", "bulldog", "lover", "baby", "gemini39", "1234567", "ncc1701",
    "barney", "apples40", "soccer", "rabbit", "victor", "brian", "august41", "hockey", "peanut", "tucker", "mark",
    "333342", "killer", "john", "princess", "startrek", "canada43", "george", "johnny", "mercedes", "sierra",
    "blazer44", "gandalf", "5150", "leather", "andrew", "spanky", "doggie", "232323", "hunting46", "charlie",
    "winter", "zzzzzz", "4444", "kitty47", "superman", "brandy", "gunner", "beavis", "rainbow48", "compaq", "tno1",
    "edward", "jason", "lucky", "dolphin33", "thomas", "charles", "walter", "helpme", "gordon34", "tigger", "girls",
    "jackie", "casper35", "robert", "booboo", "boston", "monica", "stupid36", "access", "coffee", "braves", "midnight",
    "love", "xxxxxx", "yankee", "college", "saturn38", "buster", "bulldog", "lover", "baby", "gemini39", "1234567",
    "nliam", "paul57", "daniel", "ferrari", "donald", "golden", "mine58", "golfer", "cookie", "bigdaddy", "0", "king59",
    "summer", "chicken", "bronco", "fire", "racing60", "heather", "maverick", "sandra", "555561", "hammer", "chicago",
    "voyager", "pookie", "eagle62", "yankees", "joseph", "rangers", "packers", "hentai63", "joshua", "diablo", "birdie",
    "einstein", "newyork64", "maggie", "trouble", "dolphins", "little65", "biteme", "white", "0", "redwings66", "enter",
    "666666", "topgun", "chevy", "smith67", "ashley", "winston", "sticky68", "thunder", "welcome", "warrior", "cocacola69",
    "cowboy", "chris", "green", "sammy", "animal70", "silver", "panther", "super", "broncos71", "richard", "yamaha",
    "qazwsx", "8675309", "private72", "justin", "magic", "zxcvbnm", "skippy73", "orange", "banana", "lakers", "marvin74",
    "merlin", "driver", "rachel", "power", "blondes75", "michelle", "marine", "slayer", "victoria", "enjoy76", "corvette",
    "angels", "scott", "asdfgh", "girl77", "bigdog", "fishing", "2222", "apollo78", "cheese", "david", "asdf", "toyota",
    "parker79", "matthew", "maddog", "video", "travis", "qwert80", "121212", "london", "hotdog", "time81", "patrick",
    "wilson", "7777", "paris", "sydney82", "martin", "marlboro", "rock", "women83", "freedom", "dennis", "srinivas",
    "voodoo84", "ginger", "internet", "extreme", "magnum85", "captain", "action", "redskins", "juice86", "nicole",
    "carter", "abgrtyu87", "sparky", "chester", "jasper", "77777788", "yellow", "smokey", "monster", "ford", "dreams89",
    "camaro", "xavier", "teresa", "freddy", "maxwell90", "secret", "steven", "jeremy", "arsenal", "music91", "viking",
    "11111111", "access14", "rush211292", "falcon", "snoopy", "bill", "wolf", "russia93", "taylor", "blue", "crystal",
    "scorpion94", "111111", "eagles", "iloveyou", "rebecca95", "131313", "winner", "alex", "tester96", "123123", "samantha",
    "florida", "mistress97", "house", "beer", "eric", "phantom98", "hello", "miller", "rocket", "legend", "billy99",
    "scooter", "flower", "theman", "movie", "6666","$chwarzepumpe", "$secure$", "(none)", "0", "10023", "1064", "1111",
    "123", "1234", "12345", "123456", "1234admin", "1502", "166816", "21241036", "2222", "22222", "240653C9467E45",
    "266344", "3477", "3ascotel", "3ep5w2u", "3ware", "4getme2", "4tas", "5777364", "8111", "8429", "9999", "ADMINISTRATOR",
    "ADTRAN", "ANYCOM", "Admin", "AitbISP4eCiG", "Asante", "Ascend", "BRIDGE", "CAROLIAN", "CCC", "CNAS", "COGNOS",
    "CONV", "Cisco", "Col2ogro2", "D-Link", "DISC", "Exabyte", "FIELD.SUPPORT", "Fireport", "GlobalAdmin", "HP",
    "HPDESK", "HPOFFICE", "HPOFFICE DATA", "HPONLY", "HPP187", "HPP187 SYS", "HPP189", "HPP196", "HPWORD PUB",
    "HTTP", "Helpdesk", "ILMI", "INTX3", "ITF3000", "Intel", "JDE", "LOTUS", "MAIL", "MANAGER", "MANAGER.SYS",
    "MGR", "MGR.SYS", "MPE", "MServer", "Manager", "Master", "Mau'dib", "MiniAP", "Multi", "NAU", "NETBASE",
    "NETWORK", "NICONEX", "NULL", "NetCache", "NetICs", "NetVCR", "OCS", "OP.OPERATOR", "PASS", "PASSW0RD",
    "PASSWORD", "PBX", "PRODDTA", "Password", "PlsChgMe", "Posterie", "Protector", "R1QTPS", "REGO", "REMOTE",
    "RIP000", "RJE", "ROBELLE", "ROOT500", "RSX", "SECURITY", "SERVICE", "SESAME", "SKY_FOX", "SMDR", "SUPER",
    "SUPPORT", "SYS", "SYSTEM", "SpIp", "Super", "Symbol", "TANDBERG", "TCH", "TELESUP", "TENmanUFactOryPOWER",
    "TJM", "UI-PSWD-01", "UI-PSWD-02", "User", "VESOFT", "WORD", "XLSERVER", "_Cisco", "abc123", "acc", "access",
    "adfexc", "admin", "admin123", "admin_1", "administrator", "adminttd", "admn", "adslolitec", "adtran",
    "and 2000 Series", "anicust", "any@", "apc", "articon", "asante", "ascend", "asd", "at4400", "atc123",
    "atlantis", "attack", "barricade", "bciimpw", "bcimpw", "bcmspw", "bcnaspw", "bintec", "blender", "bluepw",
    "browsepw", "cacadmin", "calvin", "cascade", "ccrusr", "cellit", "cgadmin", "changeme", "changeme!", "changeme2",
    "cisco", "client", "cmaker", "cms500", "comcomcom", "connect", "corecess", "craft", "craftpw", "crftpw", "custpw",
    "dadmin01", "danger", "davox", "default", "device", "dhs3mt", "dhs3pms", "diamond", "e250changeme", "e500changeme",
    "engineer", "enquirypw", "enter", "epicrouter", "extendnet", "field", "fivranne", "friend", "ganteng", "gen1",
    "gen2", "guest", "h179350", "hagpolm1", "hello", "help", "help1954", "highspeed", "hp.com", "hs7mwxkk", "hsadb",
    "inads", "indspw", "initpw", "installer", "intel", "intermec", "ironport", "isee", "jannie", "kermit", "kilo1987",
    "l2", "l3", "laflaf", "lantronix", "letacla", "letmein", "linga", "llatsni", "locatepw", "looker", "lp",
    "lucenttech1", "lucenttech2", "m1122", "maint", "maintpw", "manager", "master", "masterkey", "mediator",
    "medion", "michelangelo", "microbusiness", "mlusr", "monitor", "motorola", "mtch", "mtcl", "mu", "my_DEMARC",
    "n/a", "naadmin", "netadmin", "netman", "netopia", "netscreen", "nmspw", "none", "noway", "ntacdmax",
    "often blank", "op", "operator", "pass", "password", "patrol", "pbxk1064", "pento", "permit", "pilou",
    "piranha", "private", "public", "public/private/secret", "pwp", "q", "r@p8p0r+", "radius", "radware",
    "raidzone", "rcustpw", "recovery", "replicator", "rmnetlm", "ro", "root", "router", "rw", "rwa", "rwmaint",
    "scmchangeme", "secret", "secure", "security", "setup", "sitecom", "smallbusiness", "smcadmin", "smile",
    "snmp-Trap", "specialist", "speedxess", "star", "super", "superuser", "supervisor", "support", "supportpw",
    "surt", "switch", "sys", "sys/change_on_install", "sysAdmin", "sysadm", "sysadmin", "system", "tech", "telco",
    "telecom", "tellabs#1", "the same all over", "tiaranet", "tiger123", "tini", "tlah", "trancell", "tslinux",
    "tuxalize", "uplink", "user", "visual", "volition", "w2402", "webadmin", "winterm", "wlsedb", "wyse", "xbox",
    "xd", "xdfk9874t3", "xxyyzz", "zoomadsl"];

  /**
   * Common passwords.
   *
   * @function {Dict} passwords
   * @return dictionary object containing common passwords.
   *
   * @see Popcorn.Dictionary.Dict
   */
  var passwords = lib.passwords = dict.dictionary(passwords_dict);

  return lib;

}(Popcorn.Core, Popcorn.Dictionary);


/**
 * @module Popcorn.Names
 * @requires Popcorn.Core
 * @requires Popcorn.Dictionary
 */

/**
 * Most common English names and surnames dictionaries. <br/>
 * Credits to
 * <a target="_blank" href="http://www.ruf.rice.edu/~pound/#credits">Chris Pound's language machines</a>.
 *
 * @namespace Popcorn.Names
 * @author Brian Wilkerson
 * @author Adam Smyczek
 */
Popcorn.Names = function (core, dict) {

  var lib = {};

  // Names dictionary
  // http://www.ruf.rice.edu/~pound/english-m
  // http://www.ruf.rice.edu/~pound/english-f
  var names_dict = [
    "Aimee", "Aleksandra", "Alice", "Alicia", "Allison", "Alyssa", "Amy", "Andrea", "Angel", "Angela",
    "Ann", "Anna", "Anne", "Anne", "Marie", "Annie", "Ashley", "Barbara", "Beatrice", "Beth", "Betty",
    "Brenda", "Brooke", "Candace", "Cara", "Caren", "Carol", "Caroline", "Carolyn", "Carrie",
    "Cassandra", "Catherine", "Charlotte", "Chrissy", "Christen", "Christina", "Christine",
    "Christy", "Claire", "Claudia", "Courtney", "Crystal", "Cynthia", "Dana", "Danielle", "Deanne",
    "Deborah", "Deirdre", "Denise", "Diane", "Dianne", "Dorothy", "Eileen", "Elena", "Elizabeth",
    "Emily", "Erica", "Erin", "Frances", "Gina", "Giulietta", "Heather", "Helen", "Jane", "Janet", "Janice",
    "Jenna", "Jennifer", "Jessica", "Joanna", "Joyce", "Julia", "Juliana", "Julie", "Justine", "Kara",
    "Karen", "Katharine", "Katherine", "Kathleen", "Kathryn", "Katrina", "Kelly", "Kerry", "Kim",
    "Kimberly", "Kristen", "Kristina", "Kristine", "Laura", "Laurel", "Lauren", "Laurie", "Leah",
    "Linda", "Lisa", "Lori", "Marcia", "Margaret", "Maria", "Marina", "Marisa", "Martha", "Mary", "Mary",
    "Ann", "Maya", "Melanie", "Melissa", "Michelle", "Monica", "Nancy", "Natalie", "Nicole", "Nina",
    "Pamela", "Patricia", "Rachel", "Rebecca", "Renee", "Sandra", "Sara", "Sharon", "Sheri", "Shirley",
    "Sonia", "Stefanie", "Stephanie", "Susan", "Suzanne", "Sylvia", "Tamara", "Tara", "Tatiana", "Terri",
    "Theresa", "Tiffany", "Tracy", "Valerie", "Veronica", "Vicky", "Vivian", "Wendy",
    "Aaron", "Adam", "Adrian", "Alan", "Alejandro", "Alex", "Allen", "Andrew", "Andy", "Anthony", "Art",
    "Arthur", "Barry", "Bart", "Ben", "Benjamin", "Bill", "Bobby", "Brad", "Bradley", "Brendan", "Brett",
    "Brian", "Bruce", "Bryan", "Carlos", "Chad", "Charles", "Chris", "Christopher", "Chuck", "Clay",
    "Corey", "Craig", "Dan", "Daniel", "Darren", "Dave", "David", "Dean", "Dennis", "Denny", "Derek", "Don",
    "Doug", "Duane", "Edward", "Eric", "Eugene", "Evan", "Frank", "Fred", "Gary", "Gene", "George", "Gordon",
    "Greg", "Harry", "Henry", "Hunter", "Ivan", "Jack", "James", "Jamie", "Jason", "Jay", "Jeff", "Jeffrey",
    "Jeremy", "Jim", "Joe", "Joel", "John", "Jonathan", "Joseph", "Justin", "Keith", "Ken", "Kevin", "Larry",
    "Logan", "Marc", "Mark", "Matt", "Matthew", "Michael", "Mike", "Nat", "Nathan", "Patrick", "Paul", "Perry",
    "Peter", "Philip", "Phillip", "Randy", "Raymond", "Ricardo", "Richard", "Rick", "Rob", "Robert", "Rod",
    "Roger", "Ross", "Ruben", "Russell", "Ryan", "Sam", "Scot", "Scott", "Sean", "Shaun", "Stephen", "Steve",
    "Steven", "Stewart", "Stuart", "Ted", "Thomas", "Tim", "Toby", "Todd", "Tom", "Troy", "Victor", "Wade",
    "Walter", "Wayne", "William"];

  /**
   * English names dictionary.
   *
   * @function {Dict} names
   * @return dictionary object containing most common English names.
   *
   * @see Popcorn.Dictionary.Dict
   */
  var names = lib.names = dict.dictionary(names_dict);


  // Surname dictionary
  // http://www.ruf.rice.edu/~pound/english-s
  var surnames_dict = [
    "Adams", "Adamson", "Adler", "Akers", "Akin", "Aleman", "Alexander", "Allen", "Allison", "Allwood",
    "Anderson", "Andreou", "Anthony", "Appelbaum", "Applegate", "Arbore", "Arenson", "Armold",
    "Arntzen", "Askew", "Athanas", "Atkinson", "Ausman", "Austin", "Averitt", "Avila-Sakar",
    "Badders", "Baer", "Baggerly", "Bailliet", "Baird", "Baker", "Ball", "Ballentine", "Ballew", "Banks",
    "Baptist-Nguyen", "Barbee", "Barber", "Barchas", "Barcio", "Bardsley", "Barkauskas", "Barnes",
    "Barnett", "Barnwell", "Barrera", "Barreto", "Barroso", "Barrow", "Bart", "Barton", "Bass", "Bates",
    "Bavinger", "Baxter", "Bazaldua", "Becker", "Beeghly", "Belforte", "Bellamy", "Bellavance",
    "Beltran", "Belusar", "Bennett", "Benoit", "Bensley", "Berger", "Berggren", "Bergman", "Berry",
    "Bertelson", "Bess", "Beusse", "Bickford", "Bierner", "Bird", "Birdwell", "Bixby", "Blackmon",
    "Blackwell", "Blair", "Blankinship", "Blanton", "Block", "Blomkalns", "Bloomfield", "Blume",
    "Boeckenhauer", "Bolding", "Bolt", "Bolton", "Book", "Boucher", "Boudreau", "Bowman", "Boyd",
    "Boyes", "Boyles", "Braby", "Braden", "Bradley", "Brady", "Bragg", "Brandow", "Brantley", "Brauner",
    "Braunhardt", "Bray", "Bredenberg", "Bremer", "Breyer", "Bricout", "Briggs", "Brittain",
    "Brockman", "Brockmoller", "Broman", "Brooks", "Brown", "Brubaker", "Bruce", "Brumfield",
    "Brumley", "Bruning", "Buck", "Budd", "Buhler", "Buhr", "Burleson", "Burns", "Burton", "Bush",
    "Butterfield", "Byers", "Byon", "Byrd", "Bzostek", "Cabrera", "Caesar", "Caffey", "Caffrey",
    "Calhoun", "Call", "Callahan", "Campbell", "Cano", "Capri", "Carey", "Carlisle", "Carlson",
    "Carmichael", "Carnes", "Carr", "Carreira", "Carroll", "Carson", "Carswell", "Carter",
    "Cartwright", "Cason", "Cates", "Catlett", "Caudle", "Cavallaro", "Cave", "Cazamias", "Chabot",
    "Chance", "Chapman", "Characklis", "Cheatham", "Chen", "Chern", "Cheville", "Chong",
    "Christensen", "Church", "Claibourn", "Clark", "Clasen", "Claude", "Close", "Coakley", "Coffey",
    "Cohen", "Cole", "Collier", "Conant", "Connell", "Conte", "Conway", "Cooley", "Cooper", "Copeland",
    "Coram", "Corbett", "Cort", "Cortes", "Cousins", "Cowsar", "Cox", "Coyne", "Crain", "Crankshaw",
    "Craven", "Crawford", "Cressman", "Crestani", "Crier", "Crocker", "Cromwell", "Crouse", "Crowder",
    "Crowe", "Culpepper", "Cummings", "Cunningham", "Currie", "Cusey", "Cutcher", "Cyprus",
    "D'Ascenzo", "Dabak", "Dakoulas", "Daly", "Dana", "Danburg", "Danenhauer", "Darley", "Darrouzet",
    "Dartt", "Daugherty", "Davila", "Davis", "Dawkins", "Day", "DeHart", "DeMoss", "DeMuth",
    "DeVincentis", "Deaton", "Dees", "Degenhardt", "Deggeller", "Deigaard", "Delabroy", "Delaney",
    "Demir", "Denison", "Denney", "Derr", "Deuel", "Devitt", "Diamond", "Dickinson", "Dietrich",
    "Dilbeck", "Dobson", "Dodds", "Dodson", "Doherty", "Dooley", "Dorsey", "Dortch", "Doughty", "Dove",
    "Dowd", "Dowling", "Drescher", "Drucker", "Dryer", "Dryver", "Duckworth", "Dunbar", "Dunham", "Dunn",
    "Duston", "Dettweiler", "Dyson", "Eason", "Eaton", "Ebert", "Eckhoff", "Edelman", "Edmonds",
    "Eichhorn", "Eisbach", "Elders", "Elias", "Elijah", "Elizabeth", "Elliott", "Elliston", "Elms",
    "Emerson", "Engelberg", "Engle", "Eplett", "Epp", "Erickson", "Estades", "Etezadi", "Evans", "Ewing",
    "Fair", "Farfan", "Fargason", "Farhat", "Farry", "Fawcett", "Faye", "Federle", "Felcher", "Feldman",
    "Ferguson", "Fergusson", "Fernandez", "Ferrer", "Fine", "Fineman", "Fisher", "Flanagan",
    "Flathmann", "Fleming", "Fletcher", "Folk", "Fortune", "Fossati", "Foster", "Foulston", "Fowler",
    "Fox", "Francis", "Frantom", "Franz", "Frazer", "Fredericks", "Frey", "Freymann", "Fuentes",
    "Fuller", "Fundling", "Furlong", "Gainer", "Galang", "Galeazzi", "Gamse", "Gannaway", "Garcia",
    "Gardner", "Garneau", "Gartler", "Garverick", "Garza", "Gatt", "Gattis", "Gayman", "Geiger",
    "Gelder", "George", "Gerbino", "Gerbode", "Gibson", "Gifford", "Gillespie", "Gillingham",
    "Gilpin", "Gilyot", "Girgis", "Gjertsen", "Glantz", "Glaze", "Glenn", "Glotzbach", "Gobble",
    "Gockenbach", "Goff", "Goffin", "Golden", "Goldwyn", "Gomez", "Gonzalez", "Good", "Graham", "Gramm",
    "Granlund", "Grant", "Gray", "Grayson", "Greene", "Greenslade", "Greenwood", "Greer", "Griffin",
    "Grinstein", "Grisham", "Gross", "Grove", "Guthrie", "Guyton", "Haas", "Hackney", "Haddock",
    "Hagelstein", "Hagen", "Haggard", "Haines", "Hale", "Haley", "Hall", "Halladay", "Hamill",
    "Hamilton", "Hammer", "Hancock", "Hane", "Hansen", "Harding", "Harless", "Harms", "Harper",
    "Harrigan", "Harris", "Harrison", "Hart", "Harton", "Hartz", "Harvey", "Hastings", "Hauenstein",
    "Haushalter", "Haven", "Hawes", "Hawkins", "Hawley", "Haygood", "Haylock", "Hazard", "Heath",
    "Heidel", "Heins", "Hellums", "Hendricks", "Henry", "Henson", "Herbert", "Herman", "Hernandez",
    "Herrera", "Hertzmann", "Hewitt", "Hightower", "Hildebrand", "Hill", "Hindman", "Hirasaki",
    "Hirsh", "Hochman", "Hocker", "Hoffman", "Hoffmann", "Holder", "Holland", "Holloman", "Holstein",
    "Holt", "Holzer", "Honeyman", "Hood", "Hooks", "Hopper", "Horne", "House", "Houston", "Howard",
    "Howell", "Howley", "Huang", "Hudgings", "Huffman", "Hughes", "Humphrey", "Hunt", "Hunter", "Hurley",
    "Huston", "Hutchinson", "Hyatt", "Irving", "Jacobs", "Jaramillo", "Jaranson", "Jarboe", "Jarrell",
    "Jenkins", "Johnson", "Johnston", "Jones", "Joy", "Juette", "Julicher", "Jumper", "Kabir",
    "Kamberova", "Kamen", "Kamine", "Kampe", "Kane", "Kang", "Kapetanovic", "Kargatis", "Karlin",
    "Karlsson", "Kasbekar", "Kasper", "Kastensmidt", "Katz", "Kauffman", "Kavanagh", "Kaydos",
    "Kearsley", "Keleher", "Kelly", "Kelty", "Kendrick", "Key", "Kicinski", "Kiefer", "Kielt", "Kim",
    "Kimmel", "Kincaid", "King", "Kinney", "Kipp", "Kirby", "Kirk", "Kirkland", "Kirkpatrick",
    "Klamczynski", "Klein", "Kopnicky", "Kotsonis", "Koutras", "Kramer", "Kremer", "Krohn", "Kuhlken",
    "Kunitz", "LaLonde", "LaValle", "LaWare", "Lacy", "Lam", "Lamb", "Lampkin", "Lane", "Langston",
    "Lanier", "Larsen", "Lassiter", "Latchford", "Lawera", "LeBlanc", "LeGrand", "Leatherbury",
    "Lebron", "Ledman", "Lee", "Leinenbach", "Leslie", "Levy", "Lewis", "Lichtenstein", "Lisowski",
    "Liston", "Litvak", "Llano-Restrepo", "Lloyd", "Lock", "Lodge", "Logan", "Lomonaco", "Long", "Lopez",
    "Lopez-Bassols", "Loren", "Loughridge", "Love", "Ludtke", "Luers", "Lukes", "Luxemburg",
    "MacAllister", "MacLeod", "Mackey", "Maddox", "Magee", "Mallinson", "Mann", "Manning", "Manthos",
    "Marie", "Marrow", "Marshall", "Martin", "Martinez", "Martisek", "Massey", "Mathis", "Matt",
    "Maxwell", "Mayer", "Mazurek", "McAdams", "McAfee", "McAlexander", "McBride", "McCarthy",
    "McClure", "McCord", "McCoy", "McCrary", "McCrossin", "McDonald", "McElfresh", "McFarland",
    "McGarr", "McGhee", "McGoldrick", "McGrath", "McGuire", "McKinley", "McMahan", "McMahon",
    "McMath", "McNally", "Mcdonald", "Meade", "Meador", "Mebane", "Medrano", "Melton", "Merchant",
    "Merwin", "Millam", "Millard", "Miller", "Mills", "Milstead", "Minard", "Miner", "Minkoff",
    "Minnotte", "Minyard", "Mirza", "Mitchell", "Money", "Monk", "Montgomery", "Monton", "Moore",
    "Moren", "Moreno", "Morris", "Morse", "Moss", "Moyer", "Mueller", "Mull", "Mullet", "Mullins", "Munn",
    "Murdock", "Murphey", "Murphy", "Murray", "Murry", "Mutchler", "Myers", "Myrick", "Nassar", "Nathan",
    "Nazzal", "Neal", "Nederveld", "Nelson", "Nguyen", "Nichols", "Nielsen", "Nockton", "Nolan",
    "Noonan", "Norbury", "Nordlander", "Norris", "Norvell", "Noyes", "Nugent", "Nunn", "O'Brien",
    "O'Connell", "O'Neill", "O'Steen", "Ober", "Odegard", "Oliver", "Ollmann", "Olson", "Ongley",
    "Ordway", "Ortiz", "Ouellette", "Overcash", "Overfelt", "Overley", "Owens", "Page", "Paige",
    "Pardue", "Parham", "Parker", "Parks", "Patterson", "Patton", "Paul", "Payne", "Peck", "Penisson",
    "Percer", "Perez", "Perlioni", "Perrino", "Peterman", "Peters", "Pfeiffer", "Phelps", "Philip",
    "Philippe", "Phillips", "Pickett", "Pippenger", "Pistole", "Platzek", "Player", "Poddar",
    "Poirier", "Poklepovic", "Polk", "Polking", "Pond", "Popish", "Porter", "Pound", "Pounds", "Powell",
    "Powers", "Prado", "Preston", "Price", "Prichep", "Priour", "Prischmann", "Pryor", "Puckett",
    "Raglin", "Ralston", "Rampersad", "Ratner", "Rawles", "Ray", "Read", "Reddy", "Reed", "Reese", "Reeves",
    "Reichenbach", "Reifel", "Rein", "Reiten", "Reiter", "Reitmeier", "Reynolds", "Richardson",
    "Rider", "Rhinehart", "Ritchie", "Rittenbach", "Roberts", "Robinson", "Rodriguez", "Rogers",
    "Roper", "Rosemblun", "Rosen", "Rosenberg", "Rosenblatt", "Ross", "Roth", "Rowatt", "Roy", "Royston",
    "Rozendal", "Rubble", "Ruhlin", "Rupert", "Russell", "Ruthruff", "Ryan", "Rye", "Sabry", "Sachitano",
    "Sachs", "Sammartino", "Sands", "Saunders", "Savely", "Scales", "Schaefer", "Schafer", "Scheer",
    "Schild", "Schlitt", "Schmitz", "Schneider", "Schoenberger", "Schoppe", "Scott", "Seay", "Segura",
    "Selesnick", "Self", "Seligmann", "Sewall", "Shami", "Shampine", "Sharp", "Shaw", "Shefelbine",
    "Sheldon", "Sherrill", "Shidle", "Shifley", "Shillingsburg", "Shisler", "Shopbell", "Shupack",
    "Sievert", "Simpson", "Sims", "Sissman", "Smayling", "Smith", "Snyder", "Solomon", "Solon",
    "Soltero", "Sommers", "Sonneborn", "Sorensen", "Southworth", "Spear", "Speight", "Spencer",
    "Spruell", "Spudich", "Stacy", "Staebel", "Steele", "Steinhour", "Steinke", "Stepp", "Stevens",
    "Stewart", "Stickel", "Stine", "Stivers", "Stobb", "Stone", "Stratmann", "Stubbers", "Stuckey",
    "Stugart", "Sullivan", "Sultan", "Sumrall", "Sunley", "Sunshine", "Sutton", "Swaim", "Swales",
    "Sweed", "Swick", "Swift", "Swindell", "Swint", "Symonds", "Syzdek", "Szafranski", "Takimoto",
    "Talbott", "Talwar", "Tanner", "Taslimi", "Tate", "Tatum", "Taylor", "Tchainikov", "Terk", "Thacker",
    "Thomas", "Thompson", "Thomson", "Thornton", "Thurman", "Thurow", "Tilley", "Tolle", "Towns",
    "Trafton", "Tran", "Trevas", "Trevino", "Triggs", "Truchard", "Tunison", "Turner", "Twedell",
    "Tyler", "Tyree", "Unger", "Van", "Vanderzanden", "Vanlandingham", "Varanasi", "Varela", "Varman",
    "Venier", "Verspoor", "Vick", "Visinsky", "Voltz", "Wagner", "Wake", "Walcott", "Waldron", "Walker",
    "Wallace", "Walters", "Walton", "Ward", "Wardle", "Warnes", "Warren", "Washington", "Watson",
    "Watters", "Webber", "Weidenfeller", "Weien", "Weimer", "Weiner", "Weinger", "Weinheimer",
    "Weirich", "Welch", "Wells", "Wendt", "West", "Westmoreland", "Wex", "Whitaker", "White", "Whitley",
    "Wiediger", "Wilburn", "Williams", "Williamson", "Willman", "Wilson", "Winger", "Wise", "Wisur",
    "Witt", "Wong", "Woodbury", "Wooten", "Workman", "Wright", "Wyatt", "Yates", "Yeamans", "Yen", "York",
    "Yotov", "Younan", "Young", "Zeldin", "Zettner", "Ziegler", "Zitterkopf", "Zucker"];

  /**
   * English surnames dictionary.
   *
   * @function {Dict} surnames
   * @return dictionary object containing most common English surnames.
   *
   * @see Popcorn.Dictionary.Dict
   */
  var surnames = lib.surnames = dict.dictionary(surnames_dict);

  return lib;

}(Popcorn.Core, Popcorn.Dictionary);


/**
 * @module Popcorn.Network
 * @requires Popcorn.Core
 * @requires Popcorn.Common
 * @requires Popcorn.Dictionary
 * @requires Popcorn.Names
 */

/**
 * Generators for common data types used in networking.
 *
 * @namespace Popcorn.Network
 * @author Adam Smyczek
 * @author Brian Wilkerson
 */
Popcorn.Network = function (core, common, dict, names) {

  var lib = {};

  // Hex char set
  var hex = "FEDCBA9876543210";

  // ------ Utils for IP addresses ------

  // Parse and validate IP string to an int array,
  // for example "192.168.0.1" -> [192, 168, 0, 1]
  var parseIP = function(ip_str) {
    var ip   = new RegExp("(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})", "g").exec(ip_str),
        pInt = function(seg) {
          var i = parseInt(seg, 10);
          if (isNaN(i) || i > 255 || i < 0) {
            throw "Invalid IP octet " + seg + " of IP: " + ip_str;
          }
          return i;
        };
    if (ip && ip.length > 4) {
      return core.map(pInt, ip.slice(1));
    }
    throw "Invalid IP address: " + ip_str;
  };

  // Convert an IP array to a string
  var ip2str = function(ip) {
    return ip.join(".");
  };

  // Convert an IP array to an int value.
  // Uses only last three octets.
  var ip2int = function(ip) {
    if (ip.length > 3) {
      throw "Max 3 IP octets supported.";
    }
    var rip = ip.reverse();
    return core.seq(core.mapGen(rip.slice(1)), function(r, o, i) { return r + (o << (8 << i)); }, rip[0])().result;
  };

  // Opposite to ip2int converts an int to last three IP octets.
  var int2ip = function(i) {
    return core.seq(core.mapGen([0,8,16]), function(r, s) { return r.concat((i >> s) & 255); }, [])().result.reverse();
  };

  // ------ Random generators extensions ------

  /** @scope Popcorn.Core.Random */

  /**
   * Generates a random IP address string in the range
   * from 'fromIP' to 'toIP'.
   *
   * @function {generator} ipAddress
   * @param {string} fromIP - IP string of the form '192.168.0.1'.
   * @param {string} toIP - IP string of the form '192.168.0.10'.
   * @return a random IP address generator.
   */
  core.RandomLib.ipAddress = function(fromIP, toIP) {
    var ip1 = parseIP(fromIP),
        ip2 = parseIP(toIP);

    // Validate range
    if (ip1[0] !== ip2[0]) {
      throw "Ip rage to large.";
    }

    // Convert string to int array first and int using last three octets.
    var ipi1 = ip2int(ip1.slice(1)),
        ipi2 = ip2int(ip2.slice(1)),
        from = Math.min(ipi1, ipi2),
        to   = Math.max(ipi1, ipi2),
        int  = this.int(from, to);

    return core.lazy(function() {
      return core.gen(ip2str([ip1[0]].concat(int2ip(int().result))));
    });
  };

  /**
   * Generates a random mac address string. This generator
   * accepts an optional delimiter char.
   *
   * @function {generator} macAddress
   * @param {string} delimiter - an optional delimiter char.
   * @return a random mac address generator.
   */
  core.RandomLib.macAddress = function(delimiter) {
    var del = delimiter|| ":",
        hCh = this.element(hex);
    return core.lazy(function() {
      var mac = "00";
      for (var i = 0; i < 5; i++) {
        mac = mac.concat(del, hCh().result, hCh().result);
      }
      return core.gen(mac);
    });
  };

  /**
   * Random email address generator that
   * uses {@link names}, {@link surnames} and
   * {@link domains} dictionaries to generate
   * email addresses of the form 'name.surname1@surname2.domain'.
   *
   * @function {generator} emailAddress
   * @return a random email address generator.
   */
  core.RandomLib.emailAddress = function() {
    var n = names.names.element(this),
        s = names.surnames.element(this),
        d = domains.element(this);
    return core.lazy(function() {
      return core.gen("".concat(n().result, ".", s().result, "@", s().result, ".", d().result));
    });
  };


  // ------ Ohter network generator ------

  /** @scope Popcorn.Network */

  /**
   * IP range generator creates IPs in the range from 'fromIP' to 'toIP'.
   * Currently the maximum range length is restricted to 10000 elements.
   *
   * @function {generator} ipRange
   * @param {string} fromIP - IP string of the form '192.168.0.1'.
   * @param {string} count - IP string which requires the number of IPs.
   * @return a IP range generator.
   */
  var ipRange = lib.ipRange = function(fromIp, count) {
    var ip1 = parseIP(fromIp),
        max_ips = 10000,
        count = isNaN (count) || count <= 0 ? max_ips : count;

    if (count > max_ips) {
      throw "To many IP addresses, maximum range count is " + max_ips + ".";
    }

    // Convert string to int array first and int using last three octets.
    var ipi1 = ip2int(ip1.slice(1)),
        r    = [];

    // Create IP array
    for (var i = 0; i < count; i++) {
      r[i] = core.gen(ip2str([ip1[0]].concat(int2ip(i + ipi1))));
    }
    return r;
  };

  // ------ Domains dictionary ------

  // Domains dictionary
  var domains_dict = [
    "ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an",
    "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", "ax",
    "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj",
    "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca",
    "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn",
    "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", "dj",
    "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et",
    "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf",
    "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs",
    "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id",
    "ie", "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it",
    "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn",
    "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr",
    "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh",
    "mil", "mk", "ml", "mm", "mn", "mo", "mobi", "mp", "mq", "mr", "ms",
    "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name",
    "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz",
    "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr",
    "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa",
    "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn",
    "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg",
    "th", "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv",
    "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi",
    "vn", "vu", "wf", "ws", "xn", "ye", "yt", "yu", "za", "zm", "zw"];

  /**
   * Domains dictionary.
   *
   * @function {Dict} domains
   * @return the domains dictionary object.
   *
   * @see Popcorn.Dictionary.Dict
   */
  var domains = lib.domains = dict.dictionary(domains_dict);

  /**
   * Most common domains dictionary.
   * It contains the domains com, net, org, edu, gov, biz and info.
   *
   * @function {Dict} commonDomains
   * @return the common domains dictionary object.
   *
   * @see Popcorn.Dictionary.Dict
   */
  var commonDomains = lib.commonDomains = dict.dictionary(["com", "net", "org", "edu", "gov", "biz", "info"]);

  return lib;

}(Popcorn.Core, Popcorn.Common, Popcorn.Dictionary, Popcorn.Names);


// --------------------------------------------------------------------------
// Data driven testing base modules
// --------------------------------------------------------------------------
//
// All functions exposed as generator are defined in 'Mu namespace' section
// below. Currently the following generators are supported:
//
// 'range' - generates a continuous range of integer values
//   no params 	    - default range from 0 to 100
//   one int param  - range from 0 to the parameter value
//   two int params - the range from-to parameter values
//   e.g. Mu.range(0,10)
//
// 'list' - generates a test value for every parameter.
//   Only string or numbers are supported.
//	 e.g. Mu.list(0, 1, 'test')
//
// 'randomInt' - generates one random integer
//   no params 	    - integer between 0 and 1000
//   one int param  - integer between 0 and the parameter value
//   two int params - integer between the from-to parameter values
//   e.g. Mu.randomInt(0,10)
//
// 'randomAlpha' - generates a random string containing alpha chars only
//   no params 	    - string of length between 0 and 100 chars
//   one int param  - string of length between 0 and parameter value
//   two int params - string of length between from-to parameter values
//   e.g. Mu.randomAlpha(0,10)
//
// 'repeat' - repeats a string or function n times, every value is a
//          different test case. This function expects two parameters:
//   first param  - integer, test case count
//   second param - a string, integer or a function.
//   For example:
//   Mu.repeat(10, "test") - generates 10 test cases with same value "test"
//   Mu.repeat(10, Mu.randomInt(5)) - generates 10 test cases, every one
//     with a different random integer in the range from 0 to 5.
//
// 'replicate' - replicates a string n times and generates one testcase only.
//     Replicate expects two parameters:
//   first param  - integer, replication count
//   second param - a string, integer or a function.
//   For example:
//   Mu.replicate(5, "test") - generates one test case "testtesttesttesttest"
//   Mu.replicate(5,Mu.randomInt(9)) - randomInt generates an integer
//     between 0 and 9, that is replicated 5 time. A results are of the
//     form '33333', '77777' or '55555'.
//
// 'randomAlphaRepeated' - a commonly used function, combination of repeat and
//     randomAlpha. This function expects at least one parameter, the repeat count.
//   first int parameter - replication count
//   second and third parameter are optional wand work same as randomAlpha:
//     not defined    - string of length between 0 and 100 chars
//     one int param  - string of length between 0 and parameter value
//     two int params - string of length between from-to parameter values
//  e.g. Mu.randomAlphaRepeated(10, 5); generates 10 test cases with a
//     different string of length between 0 and 5
//
// 'prepend' - prepends a value to a test case value. This function takes
//     one or two parameters.
//   If one parameter is passed, the value is prepended to the default
//   value defined in the default command. The value can be a string, integer
//   or another generator, for example:
//     Mu.prepend("../") will prepend the string '../' to the default option value.
//     Mu.prepend(Mu.randomAlpha(5)) will prepend a random string of length 5
//       to the default option value.
//   In case of two parameters, the first value is expected to be string which
//   overwrites the default option value. The second parameter can be a string,
//   integer or a generator as well, for example:
//     Mu.prepend("../", "index.html") will generate "../index.html"
//     Mu.prepend("../", Mu.randomAlpha(5)) will generate a string of the form
//       '../abQrA', '../ZhGDT', '../prtjA' etc.
//
// 'append' - same as prepend, but appending
//
// 'ipRange' - generates an ip range between two IPs. The IPs are passed as string
//     in format '192.168.0.10' etc. The range is restricted to max. 5000 test
//     cases that can be generated. For example:
//     Mu.ipRange('192.168.0.253', '192.168.1.1') will generate 5 IP test cases:
//		192.168.0.253, 192.168.0.254, 192.168.0.255, 192.168.1.0, 192.168.1.1
//
// 'randomMacAddress' - generates a random MAC address
//
// 'now' - generates time stamp. Possible parameters are:
//    'days'     - outputs the day of the month
//    'hours'    - the hour of the day
//    'minutes'  - minute
//    'seconds'  - second
//    'time'     - the time in milliseconds since midnight Jan 1, 1970
// 	  'gmt'      - time string in gmt format
//    not params - time string without time zone
//  e.g. Mu.now(), Mu.now('gmt')
//
// 'empty' - Heidi: 'Generates an empty test value (no value is provided for the option)'
//
// Dictionary functions
// Currently four default dictionaries (defined in 'dictionary.js') are supported:
//   surnames, names, passwords and domains
//
// For every dictionary the following functions are defined:
//
// '<dict-name>s' - generates test-cases from the dictionary <dict-name>
//   no params 	    - generates a test-case for all values of the dictionary
//   one int param  - generates a test-case from a value 0 to param
//   two int params - generates a test-case from/to values
//                    (list boundaries are handled gracefully)
//   for example:
//     Mu.names()           - test-cases for all names
//     Mu.surnames(10)      - 10 surnames (0-9) from the password dictionary
//     Mu.passwords(10, 20) - 10 passwords (10-19) from the password dictionary
//
// 'random<dict-name>' - picks random values from a dictionary
//   no params 	    - one test-case is generated
//   one int param  - n test-cases are generated, duplications are possible
//
// 'loremipsum' - generates a sentence from the lorem ipsum. The generator
//    takes word count as parameter.
//
// 'randomEmailAddress' - generates one random email address of the form
//   <random name>.<random surname>@<random lorem ipsum workd>.<random domain>
//   using the predefined dictionaries.
//
// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
var test_defaults = {}; // options defaults initialization

// --------------------------------------------------------------------------
// Default generator library
var Mu = function(core, common, dictionary, passwords, names, network) {

    // Seed for all random generators
    var seed = 31468;

    var minMax = function(args, dmin, dmax) {
        switch(args.length) {
            case 0  : return [dmin, dmax];
            case 1  : return [dmin, core.intOf(args[0])];
            default : var a0 = core.intOf(args[0]),
                          a1 = core.intOf(args[1]);
                      return [Math.min(a0, a1), Math.max(a0, a1)];
        }
    };

    // Repeat Random Alpha
    var randAR = core.random(seed);
    var randomAlphaRepeated_impl = function() {
        var args = Array.prototype.slice.apply(arguments);
        if (args.length > 0) {
            var n = core.intOf(args[0]),
            mm = minMax(args.splice(1), 1, 100);
            return core.repeat(n, randAR.alpha.apply(randAR, [mm[0], mm[1]]));
        }
        throw "Repeat count not defined! Expecting at least one argument.";
    };

    // Random repeat dict
    var randDicRepeated = function(n, dic, rand) {
      var i = n || 1;
      return core.repeat(i, dic.element(rand));
    };

	  var _newConcat = function() {
		    var args = core.args2array(arguments), gs = [], v;
		    var num;
		    if (core.isNumber (args[0])) {
		    	num = args.shift ();
		    } else {
		    	num = 1;
		    }
		    for (var i = 0, l = args.length; i < l; i++) {
		      v = args[i];
		      gs[i] = core.isFunction(v) || core.isArray (v) ? v : core.gen(v);
		    }
		    return function (_, s) {
		    	var result = [];
		    	for (var repetition = 0; repetition < num; ++repetition) {
			    	var values = []; // repetition values
			    	for (var i = 0, len = gs.length; i < len; ++i) {
			    		var value;
			    		if (core.isFunction (gs[i])) {
			    			value = gs[i].apply (gs[i], arguments).result;
			    		} else {
			    			value = gs[i];
			    		}
			    		if (core.isArray (value)) {
			    			gs[i] = value; //Store the array so that we do not need to recompute again
			    			values[i] = value [repetition < value.length ? repetition : repetition % value.length];
			    			//Note this could be because we receive an array of functions which will need to be evaluated
			    			//This could get more complex if we receive a function or an array as a result
			    			if (core.isFunction (values[i])) {
			    				values[i] = (values[i].apply (values[i], arguments)).result;
			    			}
			    		} else {
			    			values[i] = value;
			    		}
			    	}
			    	result [repetition] = values.join ("");
		    	}

		    	return {
		    		result: result,
		    		state: s
		    	}
		    };
		  };

	  var _concat = function() {
	    var args = core.args2array(arguments), gs = [], v;
	    for (var i = 0, l = args.length; i < l; i++) {
	      v = args[i];
	      gs[i] = core.isFunction(v)? v : core.gen(v);
	    }
	    return core.seq(gs, core.cJoin, "");
	  };

    // ----------------------------------------------------
    // Mu namespace
    // ----------------------------------------------------

    var randInt   = core.random(seed);
    var randAlpha = core.random(seed);
    var randMac   = core.random(seed);
    var randEmail = core.random(seed);
    var randName  = core.random(seed);
    var randSName = core.random(seed);
    var randDom   = core.random(seed);
    var randPass  = core.random(seed);


    return {
        range  		: common.range,
        list   		: common.list,
        randomInt	: randInt.int,
        randomAlpha	: function() { return randAlpha.alpha.apply(randAlpha, core.args2array(arguments)); },
        randomAlphaRepeated : randomAlphaRepeated_impl,

        ipRange     : network.ipRange,

        prepend     : common.prepend,
        append      : common.append,
        concat		: _newConcat,
        repeat      : core.repeat,
        current     : core.current,
        replicate   : function(i, v) {
        	var g = core.isFunction(v)? v : core.gen(v);
        	return core.replicate(g, core.cJoin, '')(i);
        },

        now			    : common.now,

        surnames 			  : names.surnames.list,
        names 			    : names.names.list,
        domains 			  : network.commonDomains.list,
        passwords 			: passwords.passwords.list,
        loremipsum 			: dictionary.loremIpsum,

        randomSurnames   : function(i) { return randDicRepeated(i, names.surnames, randSName); },
        randomNames      : function(i) { return randDicRepeated(i, names.names, randName); },
        randomDomains    : function(i) { return randDicRepeated(i, network.commonDomains, randDom); },
        randomPasswords  : function(i) { return randDicRepeated(i, passwords.passwords, randPass); },

        randomEmailAddress 	: function() { return randEmail.emailAddress.apply(randEmail, core.args2array(arguments)); },
        randomMacAddress 	  : function() { return randMac.macAddress.apply(randMac, core.args2array(arguments)); },

        empty   : function() {
          return function(o) { return ""; };
        }

    };

}(Popcorn.Core,
  Popcorn.Common,
  Popcorn.Dictionary,
  Popcorn.Passwords,
  Popcorn.Names,
  Popcorn.Network);

// Rempaaing namespace
Mu.Core = Popcorn.Core;
Mu.Common = Popcorn.Common;
Mu.Dictionary = Popcorn.Dictionary;
Mu.Passwords = Popcorn.Passwords;
Mu.Names = Popcorn.Names;
Mu.Network = Popcorn.Network;

// --------------------------------------------------------------------------
// Engine functions

// Test function
// testName  : test name
// option   : object of the form
//   { 'option name' : 'value',
//     'option name' : Mu.generatur_function(),
//     ... }
// outcome  : outcome object
test = function(testName, options, outcome) {

    var core = Popcorn.Core;

    // run generator
    // permutate or circulate
    var tests = core.circulate(options, test_defaults);

    // Run tests
    for (t = 0; t < tests.length; t++) {
        var test = tests[t];

        // Convert values befor passing to Java engine
        // Run additional validation.
        for (var name in test) {
            var v = test[name];

            // Throw an exception if v is still a function
            if (core.isFunction(v) || core.isArray(v)) {
              throw "Invalid generator application. Missing parentheses?";
            }

            // Convert results to string
            if (v !== undefined) {
              v = v.toString();
            } else {
              v = "";
            }

            // Set back to object
            test[name] = v;
        }

        // Execute testcase
        engine.runTestCase(testName, t+1, test, outcome);
    }

};
