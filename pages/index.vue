<template>
    <div id="main">
        <div ref="mapRef" style="height: 300px; width: 100%;"></div>
        <div class="console">
            <div class="station-select-box-wrap">
                <select class="station-select-box" @change="handleStationChange">
                    <option value="" selected>選択してください</option>
                    <option v-for="(station, index) in stationData" :key="index" :value="station">
                        {{ station.name }}
                    </option>
                </select>
            </div>
            <div class="context">

                <div>現在地から選択した電停までの正確な距離</div>
                <div class="distance">{{ targetStationRailDistance }} メートル</div>
                <div>現在地から選択した電停までの直線距離</div>
                <div class="distance">{{ targetStationDistance }} メートル</div>
                <div>現在地から選択した電停の到着まであと</div>
                <div class="distance">{{ predictedTravelTime }}</div>
                <div>目的地方向の最寄り駅</div>
                <div class="distance">{{ nearestStation }}</div>
                <div>移動速度</div>
                <div class="distance">{{ trainSpeed }} km/h</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
import stationData from './data.json'

const ctx = useRuntimeConfig().public;

const targetStationDistance = ref(0);
const targetStationRailDistance = ref(0);
const selectStationNumber = ref();
const predictedTravelTime = ref('0分0秒');
const trainSpeed = ref(0);
let startTime = 0;
let startDistance = 0;
let startFlag = false;
let stationNum = -1;

let map: any;
const tolerance = 120; // 電停がルート上にあるかどうかを判断するための許容範囲
const mapRef = ref<HTMLElement | null>(null)
const nearestStation = ref('-');
let moveSpeed = 0;
onMounted(() => {
    // 位置情報の変化を監視
    // setInterval(() => {
    navigator.geolocation.getCurrentPosition((position) => {
        // const pos = {
        //     lat: position.coords.latitude,
        //     lng: position.coords.longitude
        // };

        const pos = {
            lat: 41.784475714327726,
            lng: 140.77572328792075
        };

        const loader = new Loader({
            apiKey: ctx.apiKey,  // ここにAPIキーを入力
            version: 'weekly',
        });

        loader.load().then(() => {
            if (mapRef.value) {
                map = new google.maps.Map(mapRef.value, {
                    center: pos,
                    zoom: 13,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                        }
                    ]
                });

                // 青い丸の表示
                new google.maps.Circle({
                    strokeColor: "#007bff",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#007bff",
                    fillOpacity: 0.35,
                    map: map,
                    center: pos,
                    radius: 50, // 半径50メートルの円
                });

                // jsonファイルから駅の情報を取得
                stationData.forEach((station: any) => {
                    // console.log(station);  // デバッグ用にstationデータを確認
                    const lat = Number(station.pos.lat);
                    const lng = Number(station.pos.lng);

                    // latとlngが数値であるか確認
                    if (!isNaN(lat) && !isNaN(lng)) {
                        new google.maps.Circle({
                            strokeColor: "#ff0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#ff0b00",
                            fillOpacity: 0.35,
                            map: map,
                            center: { lat, lng },
                            radius: 35, // 半径35メートルの円
                        });
                    } else {
                        console.error('Invalid coordinates:', lat, lng);
                    }
                });
            }
        });
        // updateTagetStationDistance(selectStationNumber.value);
    }, () => {
        console.error('Geolocation failed');
    });
    navigator.geolocation.watchPosition(handlePositionUpdate, handleError);
    // }, 1000);
});

const handleStationChange = () => {
    if (event == undefined) return;
    const stationNumber = (event.target as HTMLSelectElement).selectedIndex - 1;

    startTime = Date.now();
    startFlag = false;

    // 既存のマーカーを消すための処理
    if (map) {
        if (map.markers != undefined) {
            map.markers.forEach((marker: any) => marker.setMap(null));
            map.markers = [];
        }
    }

    // 新しいマーカーを追加するための処理
    const marker = new google.maps.Marker({
        map: map,
        position: stationData[stationNumber].pos,
        title: stationData[stationNumber].name
    });

    // マーカーを管理するための配列に追加
    if (!map.markers) {
        map.markers = [];
    }
    map.markers.push(marker);

    updateTagetStationDistance(stationNumber);
};

const updateTagetStationDistance = (stationNumber: number) => {
    if (stationNumber == undefined) return;
    selectStationNumber.value = stationNumber;
    stationNum = stationNumber;

    navigator.geolocation.getCurrentPosition((position) => {
        let closestStation = null;
        let minDistance = Infinity;

        if (mapRef.value) {
            // const pos = {
            //     lat: position.coords.latitude,
            //     lng: position.coords.longitude
            // };

            const pos = {
                lat: 41.784475714327726,
                lng: 140.77572328792075
            };

            map = new google.maps.Map(mapRef.value, {
                center: pos,
                zoom: 13,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });

            // 青い丸の表示
            new google.maps.Circle({
                strokeColor: "#007bff",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#007bff",
                fillOpacity: 0.35,
                map: map,
                center: pos,
                radius: 50, // 半径50メートルの円
            });
            // jsonファイルから駅の情報を取得
            stationData.forEach((station: any) => {
                // console.log(station);  // デバッグ用にstationデータを確認
                const lat = Number(station.pos.lat);
                const lng = Number(station.pos.lng);

                // latとlngが数値であるか確認
                if (!isNaN(lat) && !isNaN(lng)) {
                    new google.maps.Circle({
                        strokeColor: "#ff0000",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#ff0b00",
                        fillOpacity: 0.35,
                        map: map,
                        center: { lat, lng },
                        radius: 35, // 半径35メートルの円
                    });
                } else {
                    console.error('Invalid coordinates:', lat, lng);
                }
            });
            // 新しいマーカーを追加するための処理
            const marker = new google.maps.Marker({
                map: map,
                position: stationData[stationNumber].pos,
                title: stationData[stationNumber].name
            });

        }

        // 現在地の座標を取得
        const currentPosition = map.getCenter();
        // 目的地の座標を取得
        const destinationPosition = new google.maps.LatLng(stationData[stationNumber].pos.lat, stationData[stationNumber].pos.lng); // 目的の電停

        stationData.forEach((station: any, index: number) => {
            // 電停の位置をgoogle.maps.LatLngオブジェクトに変換
            const stationPosition = new google.maps.LatLng(station.pos.lat, station.pos.lng);
            // 現在地から目的地までの直線距離
            const totalDistance = google.maps.geometry.spherical.computeDistanceBetween(currentPosition, destinationPosition);
            // 現在地からi番目の電停までの距離
            const distanceToStation = google.maps.geometry.spherical.computeDistanceBetween(currentPosition, stationPosition);
            // i番目の電停から目的地までの距離
            const distanceFromStationToDestination = google.maps.geometry.spherical.computeDistanceBetween(stationPosition, destinationPosition);
            // i番目の電停がルート上にあるかどうかを判断（toleranceは許容誤差であり、tolerance以内ならルート上にあると判断）
            if (distanceToStation + distanceFromStationToDestination <= totalDistance + tolerance) {
                // ルート上にあり、かつ最も近い電停を選択
                if (distanceToStation < minDistance) {
                    minDistance = distanceToStation;
                    closestStation = index;
                }
            }
        });

        if (closestStation !== null) {
            // console.log(stationData[closestStation].name);
            if (closestStation == 20 && stationNumber > 24) {
                closestStation = 24;
            }
            else if (closestStation == 24 && stationNumber < 24) {
                closestStation = 20;
            }
            nearestStation.value = stationData[closestStation].name;
        }

        // 現在地から選択した駅までの直線距離を計算
        const stationPosition = new google.maps.LatLng(stationData[stationNumber].pos.lat, stationData[stationNumber].pos.lng);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(currentPosition, stationPosition);
        console.log(`Distance to selected station: ${distance} meters`);
        targetStationDistance.value = Number(distance.toFixed(1));


        // 駅間の距離を考慮して目的の電停までの距離を計算
        if (closestStation !== null) {
            const closestStationPosition = new google.maps.LatLng(stationData[closestStation].pos.lat, stationData[closestStation].pos.lng);
            const closerStationDistandce = google.maps.geometry.spherical.computeDistanceBetween(currentPosition, closestStationPosition);
            targetStationRailDistance.value = closerStationDistandce;

            let _trainSpeed = position.coords.speed; // 電車の速度 (m/min)
            if (_trainSpeed == null) {
                _trainSpeed = 0.0;
            }

            let timeRequired = (closerStationDistandce / 1000.0) / _trainSpeed; // 所要時間 (h)

            if (closestStation < Number(stationNumber)) {
                for (let i = closestStation; i < Number(stationNumber); i++) {
                    const stationPosition = new google.maps.LatLng(stationData[i].pos.lat, stationData[i].pos.lng);
                    const distance = google.maps.geometry.spherical.computeDistanceBetween(stationPosition, new google.maps.LatLng(stationData[i + 1].pos.lat, stationData[i + 1].pos.lng));
                    targetStationRailDistance.value += distance;
                    timeRequired += stationData[i].down_next_station_default_time;
                }
            } else if (closestStation > Number(stationNumber)) {
                for (let i = closestStation; i > Number(stationNumber); i--) {
                    const stationPosition = new google.maps.LatLng(stationData[i].pos.lat, stationData[i].pos.lng);
                    const distance = google.maps.geometry.spherical.computeDistanceBetween(stationPosition, new google.maps.LatLng(stationData[i - 1].pos.lat, stationData[i - 1].pos.lng));
                    targetStationRailDistance.value += distance;
                    timeRequired += stationData[i].up_next_station_default_time;
                    console.log(stationData[i].name);
                }
            }

            if (startFlag == false) {
                startDistance = targetStationRailDistance.value;
                startFlag = true;
            }

            trainSpeed.value = _trainSpeed * 60 * 60; // km/h
            // trainSpeed.value = 0.3 * 60 * 60; // 18 km/h
            targetStationRailDistance.value = Number(targetStationRailDistance.value.toFixed(1));
            console.log(`Distance to selected station: ${targetStationRailDistance.value} meters`);

            const _predictedTravelTime = calculateTravelTime(targetStationRailDistance.value, timeRequired, trainSpeed.value);
            // const _predictedTravelTime = "6分13秒";

            console.log("所用時間予想：", _predictedTravelTime);
            predictedTravelTime.value = String(_predictedTravelTime);
        }
    });
};

const handlePositionUpdate = (position: GeolocationPosition) => {
    // const pos = {
    //     lat: position.coords.latitude,
    //     lng: position.coords.longitude
    // };

    const pos = {
        lat: 41.784475714327726,
        lng: 140.77572328792075
    };

    if (!map) {
        const loader = new Loader({
            apiKey: ctx.apiKey,
            version: 'weekly',
        });

        loader.load().then(() => {
            if (mapRef.value) {
                map = new google.maps.Map(mapRef.value, {
                    center: pos,
                    zoom: 13,
                    styles: [
                        {
                            featureType: "poi",
                            elementType: "labels",
                            stylers: [{ visibility: "off" }]
                        }
                    ]
                });

                new google.maps.Circle({
                    strokeColor: "#007bff",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: "#007bff",
                    fillOpacity: 0.35,
                    map: map,
                    center: pos,
                    radius: 50,
                });

                stationData.forEach((station: any) => {
                    const lat = Number(station.pos.lat);
                    const lng = Number(station.pos.lng);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        new google.maps.Circle({
                            strokeColor: "#ff0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#ff0b00",
                            fillOpacity: 0.35,
                            map: map,
                            center: { lat, lng },
                            radius: 35,
                        });
                    } else {
                        console.error('Invalid coordinates:', lat, lng);
                    }
                });

                if (stationNum != -1) {
                    // 新しいマーカーを追加するための処理
                    const marker = new google.maps.Marker({
                        map: map,
                        position: stationData[stationNum].pos,
                        title: stationData[stationNum].name
                    });
                }
            }
        });
    } else {
        map.setCenter(pos); // 位置が更新された場合、地図の中心を新しい位置に設定
    }

    updateTagetStationDistance(selectStationNumber.value); // 駅の距離計算を再実行
};

const handleError = () => {
    console.error('Geolocation failed');
};

const calculateTravelTime = (distance: number, defaultTime: number, currentSpeed: number): string => {
    // 通常の速度 (単位時間あたりの移動距離)
    const defaultSpeed = (distance / 1000.0) / (defaultTime / 60.0);
    // console.log(defaultSpeed);


    // 実際の速度が通常速度より遅いか速いかによって所要時間を調整
    const adjustedTime = Math.max(0, Math.min((defaultTime / 60.0), (defaultTime / 60.0) * (defaultSpeed / currentSpeed)));

    // 分と秒に分割
    const minutes = Math.floor(adjustedTime * 60);
    const seconds = Math.floor((adjustedTime * 60 - minutes) * 60);

    // 所要時間を「何分何秒」で表示
    return `${minutes}分${seconds}秒`;
};
</script>

<style scoped>
#main {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    background-color: #FAFAFA;
}

.console {
    width: 100%;
    height: 300px;
    margin: 0 auto;
}

.station-select-box-wrap {
    text-align: center;
}

.station-select-box {
    width: 350px;
    height: 50px;
    font-size: 18px;
    margin: 20px auto;
}

.context {
    margin: 10px 20px;
    font-size: 18px;
}

.distance {
    font-size: 24px;
    font-weight: bold;
    margin: 10px 10px;
}
</style>