//define( function( require ) {

// Here, this means window
this.addEventListener( 'install', function( event ) {
    console.log( 'Service Worker installing.' );
} );

this.addEventListener( 'activate', function( event ) {
    console.log( 'Service Worker activating.' );
} );

this.addEventListener( 'fetch', function( event ) {

    //console.log( window );
    console.log( " Service worker :: Inside fetch " + event );
    event.respondWith(
        window.caches.match( event.request )
            .then( function( response ) {
                // Cache hit - return response
                if ( response ) {
                    return response;
                }

                return fetch( event.request ).then(
                    function( response ) {
                        // Check if we received a valid response
                        if ( !response || response.status !== 200 || response.type !== 'basic' ) {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        window.caches.open( 'my-site-cache-v1' )
                            .then( function( cache ) {
                                cache.put( event.request, responseToCache );
                            } );

                        return response;
                    }
                );
            } )
    );
} );

//} );