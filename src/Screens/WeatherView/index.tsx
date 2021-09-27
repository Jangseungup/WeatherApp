/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useEffect, useState} from 'react';
import {FlatList, Alert, Platform, PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import Styled from 'styled-components/native';

const Container = Styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: #EEE;
`;

const Label = Styled.Text`
    font-size: 24px;
`;

const WeatherContainer = Styled(FlatList)``;

const LoadingView = Styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;
const Loading = Styled.ActivityIndicator`
    margin-bottom: 16px;
`;
const LoadingLabel = Styled.Text`
  font-size: 16px;
`;

const WeatherItemContainer = Styled.View`
  height: 100%;
  justify-content: center;
  align-items: center;
`;
const Weather = Styled.Text`
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: bold;
`;
const Temperature = Styled.Text`
  font-size: 16px;
`;

interface Props {}

const API_KEY = '4b70362ab27be78190ff3f5e8d70fbaa';

interface IWeather {
  temperature?: number;
  weather?: string;
  isLoading: boolean;
}

interface ILocation {
  latitude: number;
  longitude: number;
}

async function requestPermission() {
  try {
    if (Platform.OS === 'ios') {
      return await Geolocation.requestAuthorization('always');
    }
    // 안드로이드 위치 정보 수집 권한 요청
    if (Platform.OS === 'android') {
      return await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  } catch (e) {
    console.log(e);
  }
}

const showError = (message: string): void => {
  setTimeout(() => {
    Alert.alert(message);
  }, 500);
};

const WeatherView = ({}: Props) => {
  const [location, setLocation] = useState<ILocation | undefined>(undefined);
  const [weatherInfo, setWeatherInfo] = useState<IWeather>({
    temperature: undefined,
    weather: undefined,
    isLoading: false,
  });

  const getCurrentWeather = () => {
    requestPermission().then(result => {
      console.log(result);
      if (result === 'granted') {
        setWeatherInfo({
          isLoading: false,
        });
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            console.log('dd', position);
            setLocation({
              latitude,
              longitude,
            });
            fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`,
            )
              .then(response => response.json())
              .then(json => {
                console.log('ddddd', json);
                setWeatherInfo({
                  temperature: json.main.temp,
                  weather: json.weather[0].main,
                  isLoading: true,
                });
              })
              .catch(error => {
                setWeatherInfo({
                  isLoading: true,
                });
                showError('날씨 정보를 가져오는데 실패하였습니다.');
              });
          },
          error => {
            console.log(error.code, error.message);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      }
    });
  };

  useEffect(() => {
    getCurrentWeather();
  }, []);

  let data = [];
  const {isLoading, weather, temperature} = weatherInfo;
  if (weather && temperature) {
    data.push(weatherInfo);
  }

  return (
    <Container>
      <WeatherContainer
        onRefresh={() => getCurrentWeather()}
        refreshing={!isLoading}
        data={data}
        keyExtractor={(item, index) => {
          return `Weather-${index}`;
        }}
        ListEmptyComponent={
          <LoadingView>
            <Loading size="large" color="#1976D2" />
            <LoadingLabel>Loading...</LoadingLabel>
          </LoadingView>
        }
        renderItem={({item, index}) => (
          <WeatherItemContainer>
            <Weather>{(item as IWeather).weather}</Weather>
            <Temperature>({(item as IWeather).temperature}°C)</Temperature>
          </WeatherItemContainer>
        )}
        contentContainerStyle={{flex: 1}}
      />
      {location ? (
        <>
          <Label>Latitude: {location.latitude}</Label>
          <Label>Latitude: {location.longitude}</Label>
        </>
      ) : (
        <Label>Loading...</Label>
      )}
    </Container>
  );
};

export default WeatherView;
