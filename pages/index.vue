<template>
    <div id="main">
        <div ref="mapRef" style="height: 500px; width: 100%;"></div>
        <div class="console">
            <div class="station-select-box-wrap">
                <select class="station-select-box" @change="handleStationChange">
                    <option v-for="(station, index) in stationData" :key="index" :value="station">
                        {{ station.name }}
                    </option>
                </select>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
import stationData from './data.json'

const ctx = useRuntimeConfig().public;

let map: any;
const mapRef = ref<HTMLElement | null>(null)

onMounted(() => {
    navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
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
                    radius: 50, // 半径100メートルの円
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
                            radius: 35, // 半径50メートルの円
                        });
                    } else {
                        console.error('Invalid coordinates:', lat, lng);
                    }
                });
            }
        });
    }, () => {
        console.error('Geolocation failed');
    });
});

const handleStationChange = () => {
    if (event == undefined) return;
    const stationNumber = (event.target as HTMLSelectElement).selectedIndex;
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
</style>