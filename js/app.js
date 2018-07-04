var map, openInfoWindow;


// google map error
function googleMapError() {
    alert('An error occurred with Google while trying to Load MAP. Please refresh the page');
}


// init google map
function init(){
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 6.42643, lng: 3.4309111},
    zoom: 13.8,
    styles: styles
  });
  ko.applyBindings(new ViewModel());
}


/*  Model */
var Location = function(info) {
  var self = this;
  this.title = info.title;
  this.lat = info.lat;
  this.lng = info.lng;

// Foursquare API Client... this is like the key
var Client_Id = 'W0E3O4V01D11XWUSFL4QUWQXX1CINZHWN1KPNPS5JQBKWFSX';
var Client_Secret = 'IJAFTXRZWXY1ZG33FFVNI5CBNVGRZZBNXPH20TI0ZJI4ZYSM';
// URL for Foursquare API..it connects us to the foursquare database..to access there content.
var fSquareUrl = 'https://api.foursquare.com/v2/venues/search?ll='
var fsurl = fSquareUrl + this.lat + ',' + this.lng
    + '&client_id=' + Client_Id + '&client_secret=' + Client_Secret +
     '&v=20180701' + '&query=' + this.title;
 // we uses json to call content from Foursquare thru  foursquare API
$.getJSON(fsurl).done(function(data) {
    var request = data.response.venues[0];
    self.category = request.categories[0].shortName;
    self.street = request.location.formattedAddress[0];
    self.city = request.location.formattedAddress[1];
    self.zip = request.location.formattedAddress[3];
    self.country = request.location.formattedAddress[4];
  }).fail(function() {
    alert('Please try again later, could not retreive data from FS API.');
  });
// set Marker
  self.marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(this.lat, this.lng),
    title: self.title,
    animation: google.maps.Animation.DROP
  });
// initiate an onclick event to open an infowindow on each marker
  self.marker.addListener('click', function() {
    // close opened infoWindow
    if (openInfoWindow) {
      openInfoWindow.close();
    }
// infoWindow content, it is the html that helps display in a preferable method...
    var WindowContent = [
        '<h4>', self.title, '</h4>',
        '<h5>(', self.category, ')</h5>',
        '<h6 class="content"> Address: </h6>',
        '<p class="content">', self.street, '</p>',
        '<p class="content">', self.city, '</p>',
        '<p class="content">', self.zip, '</p>',
        '<p class="content">', self.country, '</p>',
      ];
//  populates the infowindow when the marker is clicked.
    var infoWindow = new google.maps.InfoWindow({
        content: WindowContent.join('') });
    openInfoWindow = infoWindow;
    infoWindow.open(map, self.marker);
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    // to cancel Animation (bouncing of the marker when not click)
    setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
  });
// display marker info when selected from list
  self.selectMarker = function() {
    google.maps.event.trigger(self.marker, 'click');
  };
};


/* View Model */
var ViewModel = function() {
  var self = this;
  // array of locations
  this.searchMarker = ko.observable('');
  this.markerlist = ko.observableArray();

// adding marker data for each location
  MarkerData.forEach(function(location) {
       self.markerlist.push( new Location(location) );
   });

   // This appends our locations to a list using computed variable to connect
   // the markerlist and the search marker together
    // and it also aid Filtering through Search list with the aid of ko.utility.arrayfilter function
    // and the computed variable connect the markerlist and the search marker together
  this.searchList = ko.computed(function() {
    var query = this.searchMarker().toLowerCase();
    if (!query) {
    return ko.utils.arrayFilter(self.markerlist(), function(param) {
      param.marker.setVisible(true);
      return true;
    });
    } else {
      return ko.utils.arrayFilter(this.markerlist(), function(param) {
        if (param.title.toLowerCase().indexOf(query) >= 0) {
        return true;
        } else {
          param.marker.setVisible(false);
        return false;
        }
      });
    }
  }, this);
};
