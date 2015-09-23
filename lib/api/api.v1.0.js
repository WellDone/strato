var REM = require('remjs');

module.exports = function(opts) {
	return new REM( {
		version: "1.0",
		engine: REM.engine.mongodb({
			url: opts.db
		}),
		authentication: {
			annonymous_signup: true,
			login_authority: { 
				resource: 'people'
			}
		},
		permissions: {
			defaults: {
				'create': function( id ) { return id.masterOfTheUniverse ? true : false; },
				'read': function( id ) { return id.masterOfTheUniverse ? true : { $and: [{owner: {$exists: true}}, { owner: id.organization }] }; },
				'update': function( id ) { return id.masterOfTheUniverse ? true : { $and: [{owner: {$exists: true}}, { owner: id.organization }] }; },
				'delete': function( id ) { return id.masterOfTheUniverse ? true : { $and: [{owner: {$exists: true}}, { owner: id.organization }] }; }
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
			'webhooks': {
				permissions: {
					defaults: {
						'create': function( id ) {
							if ( id.masterOfTheUniverse || id.organization )
								return true;
							else
								return false;
						},
						'read': function( id ) { return id.masterOfTheUniverse ? true : { $and: [{owner: {$exists: true}}, { owner: id.organization }] }; },
						'update': function( id ) { return id.masterOfTheUniverse ? true : { $and: [{owner: {$exists: true}}, { owner: id.organization }] }; },
						'delete': function( id ) { return id.masterOfTheUniverse ? true : { $and: [{owner: {$exists: true}}, { owner: id.organization }] }; }
					}
				},
				defaults: {
					owner: function(resource, req) {
						return req.rem.identity.organization;
					}
				}
			},
			'people': {
				immutable_keys: ['username', 'masterOfTheUniverse', 'organization'],
				permissions: {
					defaults: {
						'create': function( id ) {
							return id.masterOfTheUniverse ? true : false;
						},
						'read': function( id ) {
							if ( id.masterOfTheUniverse )
								return true;
							else
								return { $or: [ 
									{ _id: id._id }, 
									{ $and: [
										{ organization: {$exists: true}},
										{ organization: id.organization }
									] }
								] };
						},
						'update': function( id ) {
							if ( id.masterOfTheUniverse )
								return true;
							else
								return { _id: id._id };
						},
						'delete': function( id ) {
							if ( id.masterOfTheUniverse )
								return { _id: {$ne: id._id } };
						}
					}
				}
			}
		}
	} );
};
