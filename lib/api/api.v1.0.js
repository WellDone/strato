var REM = require('remjs');
var Router = require('../util/router');
var db = require('../db')

module.exports = REM( {
	version: "1.0",
	engine: db,
	authentication: {
		annonymous_signup: true,
		login_authority: { 
			resource: 'people'
		}
	},
	permissions: {
		defaults: {
			'create': function( id ) { return id.admin === "true"; },
			'read': function( id ) { return id.admin === "true" ? true : { owner: id.organization }; },
			'update': function( id ) { return id.admin === "true"? true : { owner: id.organization }; },
			'create': function( id ) { return id.admin === "true"; }
		},
		annonymous: []
	},
	resources: {
		'monitors': {
			children: ['reports']
		},
		'reports': {
			forbid: ['post']
		},
		'alerts': {},
		'people': {
			permissions: {
				defaults: {
					'create': function( id ) {
						if ( id.masterOfTheUniverse === true || id.username == 'admin' )
							return true;
					},
					'read': function( id ) {
						if ( id.masterOfTheUniverse === true || id.username == 'admin' )
							return true;
						else
							return { $or: [ { _id: id._id }, { organization: id.organization } ] };
					},
					'update': function( id ) {
						if ( id.masterOfTheUniverse === true || id.username == 'admin' )
							return true;
						else
							return { _id: id._id };
					},
					'delete': function( id ) {
						if ( id.masterOfTheUniverse === true || id.username == 'admin' )
							return { $not: { _id: id._id } };
					}
				}
			}
		}
	}
} );