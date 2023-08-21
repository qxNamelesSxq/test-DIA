// Импортируем необходимые модули и компоненты
// Импортируем необходимые модули и компоненты
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

// Создаем нижнюю панель навигации с двумя вкладками: Home и DriveMode
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
}

// Создаем компонент BottomTabNavigator
function BottomTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="DriveMode" component={DriveModeScreen} />
    </Tab.Navigator>
  );
}

// Создаем экран Home с простым текстом
function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the home screen!</Text>
    </View>
  );
}

// Создаем экран DriveMode с картой и маршрутами
function DriveModeScreen() {
  // Определяем состояние для хранения координат точек A и B
  const [pointA, setPointA] = useState({ latitude: 48.8566, longitude: 2.3522 }); // Париж
  const [pointB, setPointB] = useState({ latitude: 51.5074, longitude: -0.1278 }); // Лондон

  // Определяем состояние для хранения координат пользователя
  const [userLocation, setUserLocation] = useState(null);

  // Определяем состояние для хранения видимости модального окна
  const [modalVisible, setModalVisible] = useState(false);

  // Определяем состояние для хранения информации о маршруте
  const [routeInfo, setRouteInfo] = useState(null);

  // Определяем функцию для получения геолокации пользователя при первом рендеринге
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  // Определяем функцию для подписки на обновления геолокации пользователя при каждом рендеринге
  useEffect(() => {
    let subscriber = null;
    (async () => {
      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => {
          setUserLocation(location.coords);
        }
      );
    })();
    return () => subscriber.remove();
  }, []);

  // Определяем функцию для отображения модального окна с информацией о маршруте
  const showRouteInfo = (info) => {
    setRouteInfo(info);
    setModalVisible(true);
  };

  // Определяем функцию для скрытия модального окна
  const hideModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <MapScreen
        pointA={pointA}
        pointB={pointB}
        userLocation={userLocation}
        showRouteInfo={showRouteInfo}
      />
      <ModalScreen
        modalVisible={modalVisible}
        routeInfo={routeInfo}
        hideModal={hideModal}
      />
    </View>
  );
}

// Создаем компонент MapScreen
function MapScreen({ pointA, pointB, userLocation, showRouteInfo }) {
  return (
    <MapView style={styles.map} initialRegion={{
      latitude: (pointA.latitude + pointB.latitude) / 2,
      longitude: (pointA.longitude + pointB.longitude) / 2,
      latitudeDelta: Math.abs(pointA.latitude - pointB.latitude) * 1.5,
      longitudeDelta: Math.abs(pointA.longitude - pointB.longitude) * 1.5,
    }}>
      {/* Рисуем маркеры для точек A и B */}
      <Marker coordinate={pointA} title="Point A" />
      <Marker coordinate={pointB} title="Point B" />

      {/* Рисуем маршрут от точки A до точки B */}
      <MapViewDirections
        origin={pointA}
        destination={pointB}
        apikey="YOUR KEY"
        strokeWidth={3}
        strokeColor="blue"
        alternatives={true}
        onReady={showRouteInfo}
      />

      {/* Рисуем маркер для местоположения пользователя, если он есть */}
      {userLocation && <Marker coordinate={userLocation} title="User Location" />}

      {/* Рисуем маршрут от местоположения пользователя до точки A, если он есть */}
      {userLocation && (
        <MapViewDirections
          origin={userLocation}
          destination={pointA}
          apikey="YOUR KEY"
          strokeWidth={3}
          strokeColor="green"
        />
      )}
    </MapView>
  );
}

// Создаем компонент ModalScreen
function ModalScreen({ modalVisible, routeInfo, hideModal }) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={hideModal}
    >
      <View style={styles.modal}>
        <Text style={styles.modalText}>
          Distance: {routeInfo?.distance.toFixed(2)} km
        </Text>
        <Text style={styles.modalText}>
          Duration: {routeInfo?.duration.toFixed(2)} min
        </Text>
        <Button title="Close" onPress={hideModal} />
      </View>
    </Modal>
  );
}



// Определяем стили для компонентов
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  modal: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 15,
  },
});
