// Locations Model
var locations = [{
        title: "Zoo Atlanta",
        address: "800 Cherokee Avenue SE, Atlanta, GA 30315, USA",
        coordinates: {
            lat: 33.739642,
            lng: -84.371721
        },
    },

    {
        title: "Georgia Aquarium",
        address: "225 Baker St NW, Atlanta, GA 30313, USA",
        coordinates: {
            lat: 33.763424,
            lng: -84.394891
        },
    },
    {
        title: "CNN Center",
        address: "190 Marietta St NW, Atlanta, GA 30303, USA",
        coordinates: {
            lat: 33.757716,
            lng: -84.394429
        },
    },
    {
        title: "Children's Museum of Atlanta",
        address: "275 Centennial Olympic Park Dr NW, Atlanta, GA 30313, USA",
        coordinates: {
            lat: 33.762568,
            lng: -84.391432
        },
    },
    {
        title: "High Museum of Art",
        address: "1280 West Peachtree St NW, Atlanta, GA 30309, USA",
        coordinates: {
            lat: 33.789585,
            lng: -84.388522
        },
    },
    {
        title: "World of Coca-Cola",
        address: "121 Baker St NW, Atlanta, GA 30313, USA",
        coordinates: {
            lat: 33.762742,
            lng: -84.392664
        },
    },
    {
        title: "Jimmy Carter Library and Museum",
        address: "441 Freedom Pkwy NE, Atlanta, GA 30307, USA",
        coordinates: {
            lat: 33.766457,
            lng: -84.35624
        },
    }
];

var map;
var largeInfoWindow;
var markers = [];

// initializing the map ad marker and renders Google Maps and location markers
function initMap() {
    map = new google.maps.Map(document.querySelector(".map"), {
        center: {
            lat: 33.748995,
            lng: -84.387982
        },
        zoom: 13,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    largeInfoWindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    // Looping through array of locations properties and adds the info to each marker
    for (var i = 0; i < locations.length; i++) {
        var name = locations[i].title;
        var position = locations[i].coordinates;
        var address = locations[i].address;
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: name,
            address: address,
            animation: google.maps.Animation.DROP,
            id: i
        });
        locations[i].marker = marker;
        bounds.extend(marker.position);

        // When user clicks a marker goes to the function called handler

        google.maps.event.addListener(marker, "click", handler);
    }
    /// Automatically centralizes all markers to fit on browser
    map.fitBounds(bounds);
}
// this function displays its information window and makes it bounce
function handler() {
    populateInfoWindow(this);
    Bounce(this);
}

// Sets bounce animation when marker is clicked
function Bounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {

        // Pans marker and info window to center of page when clicked
        map.panTo(marker.position);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        // Sets time limit for bounce
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }
}

// Populates info window with relevant details
function populateInfoWindow(marker) {
    var self = this;
    if (largeInfoWindow.marker != marker) {
        largeInfoWindow.marker = marker;

        // Opens up 'loading...' message while AJAX call is retrieving data
        largeInfoWindow.open(map, marker);
        largeInfoWindow.setContent('Loading...');
        // Wikipedia
        var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + marker.title + "&format=json&callback?";
        // Displays error message if unable to retrieve data
        this.apiTimeout = setTimeout(function() {
            alert("ERROR: Failed to load data");
        }, 3000);
        //  ajax request object is created
        $.ajax({
            type: "GET",
            async: false,
            url: wikiUrl,
            dataType: "jsonp",
            success: function(data) {
                console.log(data);
                // Info window closes with 'close' button is click event
                largeInfoWindow.addListener("closeclick", function() {
                    largeInfoWindow.marker = null;
                });

                // info window is added with additionla information from array
                largeInfoWindow.setContent("<p><strong>" + marker.title + "</strong><br>" + marker.address + "</p><p>" + data[2][0] + "</p><p>" + "Click <a href='" + data[3][0] + "' target='_blank'><strong>THIS LINK</strong></a> for more information on " + marker.title + ".</p>");
                clearTimeout(self.apiTimeout);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            largeInfoWindow.addListener("closeclick", function() {
                largeInfoWindow.marker = null;
            });

            // an error is appended to info window is falied
            largeInfoWindow.setContent("<p><strong>" + marker.title + "</strong><br>" + marker.address + "</p><p> Sorry. Could not retrieve data for " + marker.title + ".</p>");
        });
    }
}

// Map View Model
var ViewModel = function() {

    // Binds each marker with it's respective list view item when clicked
    this.listItemClick = function() {
        google.maps.event.trigger(this.marker, 'click');
    };
    // Search filter is made into an observable
    this.filter = ko.observable("");

    // This ko.dependentObservable function will return and filter out list view items to match search input
    this.filterLocations = ko.dependentObservable(function() {
        var search = this.filter().toLowerCase();
        if (largeInfoWindow) {
            largeInfoWindow.close();
        }
        return ko.utils.arrayFilter(locations, function(place) {
            if (place.title.toLowerCase().indexOf(search) >= 0) {
                // check if the marker exists and sets markers to visible if true
                if (typeof place.marker === "object") {
                    place.marker.setVisible(true);
                }
                return true;
            } else {
                // marker does not exists then it sets markers to be invisble
                if (typeof place.marker === 'object') {
                    place.marker.setVisible(false);
                }
                return false;
            }
        });
    }, this);
};
// Applies binding to new View Model object
ko.applyBindings(new ViewModel());
