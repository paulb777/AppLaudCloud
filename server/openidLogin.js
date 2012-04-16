/* PaulB - This code was adapted from the node-openid sample program which has the following
    header
*/

/* A simple sample demonstrating OpenID for node.js
 *
 * http://ox.no/software/node-openid
 * http://github.com/havard/node-openid
 *
 * Copyright (C) 2010 by H�vard Stranden
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 */

var openid = require('openid');
var querystring = require('querystring');

var useridDb = require('./useridDb');
var connectionDb = require('./connectionDb');
var myUrl = require('./myUrl');
var url = myUrl.getUrl() + ':' + myUrl.getPort();

var extensions = [new openid.UserInterface(), 
                  new openid.SimpleRegistration(
                      {
                        "nickname" : true, 
                        "email" : true, 
                        "fullname" : true,
                        "dob" : true, 
                        "gender" : true, 
                        "postcode" : true,
                        "country" : true, 
                        "language" : true, 
                        "timezone" : true
                      }),
                  new openid.AttributeExchange(
                      {
                        "http://axschema.org/contact/email": "required",
                        "http://axschema.org/namePerson/friendly": "required",
                        "http://axschema.org/namePerson": "required"
                      })];

var relyingParty = new openid.RelyingParty(
    url + '/verify', // Verification URL (yours)
    null, // Realm (optional, specifies realm for OpenID authentication)
    false, // Use stateless verification
    false, // Strict mode
    extensions); // List of extensions to enable and include

exports.authenticate = function(res, query) {
    // User supplied identifier
    var identifier = query.openid_identifier;  
//    console.log(".");
//    console.log('.authenticate: identifier is ' + identifier);

    // Resolve identifier, associate, and build authentication URL
    relyingParty.authenticate(identifier, false, function(error, authUrl) {
//        console.log('authUrl ' + authUrl);
        if (error) {
            res.writeHead(200);
            res.end('Authentication failed: ' + error);
        } else if (!authUrl) {
            res.writeHead(200);
            res.end('Authentication failed');
        } else {
            // MDS Can I send url here, not contents at url?
//            console.log(".authenticate: authUrl = " + authUrl);
            
            // MDS attempting to change it all around
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write(authUrl);
            
            // orig code below
//            res.writeHead(302, {
//                Location : authUrl
//            });
            res.end();
        }
    });
};

exports.verify = function(req, res) {
    // Verify identity assertion
    // NOTE: Passing just the URL is also possible

    // MDS
//    console.log(".verify: req.url = " + req.url);
    
    relyingParty.verifyAssertion(req, function(error, result) {

        if (error) {
            // console.log(".verify: req.url = " + req.url);
            res.writeHead(200);
            res.end('MDS Authentication failed: ' + error);
        } else {
            // Result contains properties:
            // - authenticated (true/false)
            // - answers from any extensions (e.g. 
            //   "http://axschema.org/contact/email" if requested 
            //   and present at provider)
            if (result.authenticated) {
                // MDS
//                console.log(".");
//                console.log(".verify: JSON.stringify(result) : " + JSON.stringify(result));
                var userid = useridDb.getOrPreRegister(result.claimedIdentifier, req.session.id, result.email);
                var location;
                if (userid) {
                    req.session.data.user = userid;
                    connectionDb.set(userid, req.session.id);
                    location = url + '/loginresult.html';
                    console.log(userid + ' logged in at ' + new Date());
                } 
                else {
                    location = url + '/loginresult.html?email=' + result.email;
                }
                // MDS
                res.writeHead(302, {
                    Location : location
                });
                res.end();
            } else {
                console.log('Authentication failed:' + JSON.stringify(result));
                res.writeHead(200);
                res.end('Authentication Failure :(\n\n');
            }
        }
    });
};

