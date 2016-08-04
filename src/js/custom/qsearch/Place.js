/*
 * ogrid.QSearchProcessor.Place
 *
 * Extension class to support geo search for Quick Search classes
 */

ogrid.QSearchProcessor.Place = ogrid.QSearchProcessor.extend({
    //private attributes
    _options:{},

    //customize this RegEx pattern for this processor
    _pattern: '',
    _input:'',

    //public attributes


    //constructor
    init: function(options) {
        if (options) {
            this._options = ($.extend(this._options, options));
        }
    },


    //private methods
    _getInitialGeoJson: function() {
        //create a geojson object
        return {
            "type" : "FeatureCollection",
            "features" : [],
            //meta view formatting overrides default from dataset descriptor
            "meta": {
                "view": {
                    "id": "place",
                    "displayName": "Place/Address",
                    "options": {
                        "rendition": {
                            "icon":"marker"
                        }
                    },
                    "columns": [
                        {"id":"name", "displayName":"Name", "dataType":"string", "popup":true, "list":true, "sortOrder":1},
                        {"id":"score", "displayName":"Score", "dataType":"number", "popup":true, "list":true, "sortOrder":2},
                        {"id":"type", "displayName":"Type", "dataType":"string", "popup":true, "list":true, "sortOrder":3},
                        {"id":"lat", "displayName":"Latitude", "dataType":"float", "popup":true, "list":true, "sortOrder":4},
                        {"id":"long", "displayName":"Longitude", "dataType":"float", "popup":true, "list":true, "sortOrder":5}
                    ]
                }
            }
        };
    },

    _isNonPOI: function(addrType) {
        return (addrType.indexOf('address') > -1);
    },

    _getAddrTypeScore: function(addrType) {
        if (addrType === 'PointAddress')
            return 5;
        if (addrType === 'BuildingName')
            return 4;
        if (addrType === 'StreetAddress')
            return 3;
        if (addrType === 'StreetName')
            return 2;
        return 1;
    },

    _getLocationSorter: function() {
        var me = this;

        //sort descending
        return function(a, b) {
            if (!a || !b)
                return 0;

            //sort by score
            if (a.relevance > b.relevance)
                return -1;
            else if (a.relevance < b.relevance)
                return 1;

            return 0;
        };
    },

    _filterAddresses: function(locations) {
        var me = this;

        if (this._options.esriGeocodeFilterUsingShape) {
            console.log("location Filter");
            var filtered = [];
            var layer = L.geoJson(this._options.esriGeocodeFilterUsingShape);
            $.each(locations, function( i, v ) {
                console.log("Id=" + v.id);
                /*if (me._isNonPOI(v.id)) {
                 //console.log("Passed Non-Poi " + v.geometry.coordinates[0]);
                 //test if in layer
                 var r = leafletPip.pointInLayer(L.latLng(v.geometry.coordinates[1],v.geometry.coordinates[0]), layer);
                 if (r && (r.length > 0)) {
                 //console.log("pushed");
                 filtered.push(v);
                 }
                 } else*/
                filtered.push(v);
            });
            return filtered;
        } else
        //return un-changed
            return locations;
    },

    _dumpNames: function(locations) {
        var s='';
        $.each(locations, function( i, v ) {
            s+=v.name + '\n';
        });
        return s;
    },

    _processData: function(data) {
        var o = this._getInitialGeoJson();

        if (data.features.length >= 1) {
            console.log("Raw results from ArcGIS WorldGeocoder: (" + data.features.length + ")", data.features, this._dumpNames(data.features));
            data.features = this._filterAddresses(data.features);

            console.log("Filtered results: ", data.features, this._dumpNames(data.features));

            //sort based on score and addr type
            data.features.sort(this._getLocationSorter());

            console.log("Sorted results: ", data.features, this._dumpNames(data.features));

            for (var i in data.features) {
                //need an Id for interaction between table and map to work
                var id = ogrid.guid();

                if (data.features[i]) {
                    o.features.push( {
                        type:"Feature",
                        id: id,
                        "properties": {
                            "name":  data.features[i].place_name,
                            "score": data.features[i].relevance,
                            "type": data.features[i].id//,
                            //"lat": data.features[i].feature.geometry.y,
                            //"long": data.features[i].feature.geometry.x
                        },
                        "geometry": {"type": "Point", "coordinates": data.features[i].geometry.coordinates}
                    });

                    //for specific address quick searches, return only 1 if most relevant result (1st result) is an address type not POI
                    /* if ( i=='0' &&
                     data.features[i].feature.attributes.Addr_type &&
                     this._isNonPOI(data.features[i].feature.attributes.Addr_type)) {
                     console.log("Addr_type" + data.features[i].feature.attributes.Addr_type +" - Only Non-POI first result will be returned");
                     break;
                     }*/
                }



            }

        }
        /*if (data.locations.length >= 1) {
         console.log("Raw results from ArcGIS WorldGeocoder: (" + data.locations.length + ")", data.locations, this._dumpNames(data.locations));
         data.locations = this._filterAddresses(data.locations);

         console.log("Filtered results: ", data.locations, this._dumpNames(data.locations));

         //sort based on score and addr type
         data.locations.sort(this._getLocationSorter());

         console.log("Sorted results: ", data.locations, this._dumpNames(data.locations));

         for (var i in data.locations) {
         //need an Id for interaction between table and map to work
         var id = ogrid.guid();

         if (data.locations[i].feature) {
         o.features.push( {
         type:"Feature",
         id: id,
         "properties": {
         "name":  data.locations[i].name,
         "score": data.locations[i].feature.attributes.Score,
         "type": data.locations[i].feature.attributes.Type,
         "lat": data.locations[i].feature.geometry.y,
         "long": data.locations[i].feature.geometry.x
         },
         "geometry": {"type": "Point", "coordinates": [data.locations[i].feature.geometry.x, data.locations[i].feature.geometry.y]}
         });

         //for specific address quick searches, return only 1 if most relevant result (1st result) is an address type not POI
         if ( i=='0' &&
         data.locations[i].feature.attributes.Addr_type &&
         this._isNonPOI(data.locations[i].feature.attributes.Addr_type)) {
         console.log("Addr_type" + data.locations[i].feature.attributes.Addr_type +" - Only Non-POI first result will be returned");
         break;
         }
         }



         }

         }*/
        return o;
    },

    //public methods
    //returns RegEx pattern for supported command
    getPattern: function() {
        return this._pattern;
    },


    exec: function(input, onSuccess, onError) {
        var me = this;

        //force to look within chicago (make configurable later)
        var txt = encodeURI(input);

        //default bounding box to use for esri geoCode search (East IL area)
        var bbox = 'bbox=-89.2700, 37.0000, -87.5000, 42.5000';
        var location = '';
        console.log('ogrid.Config.quickSearch.pluginOptions.places.esriGeocodeBox', ogrid.Config.quickSearch.pluginOptions.places.esriGeocodeBox);

        //overlay with bbox from config, if any
        if (this._options.esriGeocodeBBox) {
            bbox = 'bbox=' + ogrid.Config.quickSearch.pluginOptions.places.esriGeocodeBox;
        }

        if (this._options.esriGeocodeLocation) {
            location = 'location=' + this._options.esriGeocodeLocation;
        }

        $.ajax({
            //use ArcGIS online's geocoder server
            //url: 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?outSr=4326&outFields=*&maxLocations=' +
            //    (me._options.esriGeocodeMaxResults || 20) +
            //    '&' + bbox + '&text=' + txt + '&f=json' + '&' + location,

            url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+ txt+'.json?limit=' +
            (me._options.esriGeocodeMaxResults || 20) +
            '&country=us&proximity=' + ogrid.Config.quickSearch.center +
            '&types=address%2Cpoi%2Cneighborhood%2Cpostcode' +
            '&autocomplete=true&' + bbox +
            '&access_token=pk.eyJ1IjoiYWRpbGxtYW4iLCJhIjoiY2lwdTd3NzJiMGEzMGgxbnJqdHZwaWVxcSJ9.HpZ7brwhP_TBPjTNgnUjlQ',
            type: 'GET',
            async: true,
            timeout: ogrid.Config.service.timeout,
            xhrFields: {
                withCredentials: false
            },
            headers: {
                // Set any custom headers here.
                // If you set any non-simple headers, your server must include these
                // headers in the 'Access-Control-Allow-Headers' response header.
            },
            success: function(data) {
                //data coming back is string
                onSuccess(me._processData(data));
            },
            error: function(jqXHR, txtStatus, errorThrown) {
                if (txtStatus === 'timeout') {
                    ogrid.Alert.error('Search has timed out.');
                } else {
                    ogrid.Alert.error( (jqXHR.responseText) ? jqXHR.responseText : txtStatus);
                }
            },
            statusCode: {
                //placeholder
                404: function() {
                    ogrid.Alert.error("ArcGIS Online Geocoder service cannot be reached at this time. Make sure an internet connection is available then try again.");
                }
            }
        });
    }
});

//support syntax without 'new' keyword (note: Camel-cased name)
ogrid.QSearchProcessor.place = function (options) {
    return new ogrid.QSearchProcessor.Place(options);
};
