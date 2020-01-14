function App() {
    $( "#okButton" ).click( function() {
        var username = $( "#usernameTextBox" ).val();
        $( "body" ).empty();
        $( "body" ).append( "<h1>Welcome " + username + "</h1><button id='getChartButton'>Get Chart</button>" );

        $( "#getChartButton" ).click( function() {
            alert( "Get Chart clicked" )
        } );
    } );
};
