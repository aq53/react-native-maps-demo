import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Polygon, Callout } from "react-native-maps";

var points = [];
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [],
      location: null
    };
  }
  findCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const location = JSON.stringify(position);

        this.setState({ location });
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };
  render() {
    console.log("myCoordinates: ", this.state.location);
    return (
      <View style={{ flex: 1 }}>
        <MapView
          onRegionChange={region => {
            points.push(region);
          }}
          style={styles.map}
          showsUserLocation
          followsUserLocation
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
        >
          {this.state.markers.length ? (
            <Polygon coordinates={this.state.markers} />
          ) : null}

          {this.state.markers.map((marker, index) => {
            return <Marker key={index} coordinate={marker} draggable />;
          })}
        </MapView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.bubble, styles.button]}
            onLongPress={this.findCoordinates}
            onPress={() => {
              this.setState({
                markers: []
              });
            }}
          >
            <Text style={styles.bottomBarContent}>Reset Markers</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.bubble, styles.button]}
            onLongPress={this.findCoordinates}
            onPress={() => {
              this.setState({
                markers: [...this.state.markers, points[points.length - 1]]
              });
            }}
          >
            <Text style={styles.bottomBarContent}>Add Marker</Text>
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
    marginVertical: 20,
    backgroundColor: "transparent"
  }
});

export default App;
