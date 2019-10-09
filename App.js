import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform
} from "react-native";
import MapView, {
  Marker,
  AnimatedRegion,
  Polyline,
  Callout,
  PROVIDER_GOOGLE,
  Polygon
} from "react-native-maps";
import haversine from "haversine";
import Geocoder from 'react-native-geocoding';

const { height, width } = Dimensions.get("window");

var points = [];

// const LATITUDE = 29.95539;
const LATITUDE = 37.78825;
// const LONGITUDE = 78.07513;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = 0.0421;


Geocoder.init("AIzaSyDjn0Uytv_FSUwwpOUTVCvL4vKYU7Ev7VU"); // use a valid API key

class AnimatedMarkers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      routeCoordinates: [],
      loading: true,
      distanceTravelled: 0,
      distance: 0,
      prevLatLng: {},
      markers: [],
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE
      })
    };
  }

  componentWillMount() {

    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({ loading: false });
      },
      error => {
        alert(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000
      }
    );
  }

  componentDidMount() {
    const { coordinate } = this.state;
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        const { coordinate, routeCoordinates, distanceTravelled } = this.state;
        const { latitude, longitude } = position.coords;
        console.log('position:',position)
        const newCoordinate = {
          latitude,
          longitude
        };
        Geocoder.from({latitude:24.845446, longitude:67.001826})
        .then(json => {
            var location = json.results[0].geometry.location;
            console.log('location:',json);
        })
        .catch(error => console.log('geocode location: error',error));
    
    
        if (Platform.OS === "android") {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(
              newCoordinate,
              500
            );
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }

        this.setState({
          latitude,
          longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate
        });
      },
      error => console.log(error),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
  };
  onCalculateDistance = () => {
    let { markers } = this.state;
    if (markers.length >= 2) {
      this.setState({
        distance: haversine(markers[0], markers[markers.length - 1])
      });
    } else {
      alert("Please add markers first");
    }
  };
  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

  render() {
    return (
      <View style={styles.container}>
        <MapView
          onRegionChange={region => {
            console.log('region:',region)
            points.push(region);
          }}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
          style={styles.map}
          showsUserLocation
          followsUserLocation
          // provider={PROVIDER_GOOGLE}
          loadingEnabled
          region={this.getMapRegion()}
        >
          {this.state.markers.length ? (
            <Polygon
              tappable
              fillColor="rgba(0,0,0,0.2)"
              coordinates={this.state.markers}
            />
          ) : null}

          {this.state.markers.map((marker, index) => {
            return (
              <Marker
                key={index}
                coordinate={marker}
                description={JSON.stringify(marker)}
              >
              <Callout tooltip />
              </Marker>
            );
          })}
        </MapView>

        {this.state.loading ? (
          <View style={styles.buttonContainer}>
            <View style={[styles.bubble, styles.button]}>
              <Text style={styles.bottomBarContent}>Searching for GPS ...</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.bubble, styles.button]}
            onPress={() => {
              points=[]
              this.setState({
                markers: [],
                distance: 0
              });
            }}
          >
            <Text style={styles.bottomBarContent}>Reset Markers</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.bubble, styles.button]}
            onPress={() => {
              this.setState({
                markers: [
                  ...this.state.markers,
                  points[points.length - 1] || {
                    latitude: this.state.latitude,
                    longitude: this.state.longitude,
                    latitudeDelta: this.state.latitudeDelta,
                    longitudeDelta: this.state.longitudeDelta
                  }
                ]
              });
            }}
          >
            <Text style={styles.bottomBarContent}>Add Marker</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.bubble, styles.button]}
            onPress={this.onCalculateDistance}
          >
            <Text style={styles.bottomBarContent}>Calculate Distance</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text style={styles.bottomBarContent}>
              {parseFloat(this.state.distance).toFixed(3)} km
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 5,
    backgroundColor: "transparent"
  }
});

export default AnimatedMarkers;
