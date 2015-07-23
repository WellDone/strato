var REM = require('remjs');
var Router = require('../util/router');

module.exports = new REM( {
	version: "1.0",
	engine: REM.engine.mongodb({
		url: process.env.DATABASE_URL
	}),
	authentication: {
		annonymous_signup: true,
		login_authority: { 
			resource: 'people'
		}
	},
	permissions: {
		defaults: {
			'create': function( id ) { return id.admin === "true"; },
			'read': function( id ) { return id.admin === "true" ? true : { $and: [{owner: {$exists: true}}, { owner: id.organization }] }; },
			'update': function( id ) { return id.admin === "true"? true : { $and: [{owner: {$exists: true}}, { owner: id.organization }] }; },
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
						if ( id.masterOfTheUniverse || id.username == 'admin@welldone.org' )
							return true;
					},
					'read': function( id ) {
						if ( id.masterOfTheUniverse || id.username == 'admin@welldone.org' )
							return true;
						else
							return
							{ $or: [ 
								{ _id: id._id }, 
								{ $and: [
									{organizations: {$exists: true}},
									{ organization: id.organization }
								] }
							] };
					},
					'update': function( id ) {
						if ( id.masterOfTheUniverse || id.username == 'admin@welldone.org' )
							return true;
						else
							return { _id: id._id };
					},
					'delete': function( id ) {
						if ( id.masterOfTheUniverse || id.username == 'admin@welldone.org' )
							return { _id: {$ne: id._id } };
					}
				}
			}
		}
	}
} );