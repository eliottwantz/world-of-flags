<script lang="ts">
	import geojsonData from '$lib/geojson/countries.json';
	import type { GeoJsonObject } from 'geojson';
	import L, { type LeafletMouseEventHandlerFn } from 'leaflet';
	import 'leaflet/dist/leaflet.css';

	let mapL = $state<L.Map | undefined>(undefined);

	$effect(() => {
		console.log(geojsonData);
		const map = L.map('map');
		map.setView([15, 0], 2);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 20
		}).addTo(map);

		//@ts-ignore
		L.geoJSON(geojsonData.features, {
			onEachFeature: (feature, layer) => {
				layer.on({
					click: handleClick
				});
			}
		}).addTo(map);

		mapL = map;
	});

	const handleClick: LeafletMouseEventHandlerFn = (event) => {
		const properties = event.target.feature.properties as {
			ADMIN: string;
			ISO_A3: string;
			ISO_A2: string;
		};
		console.log('Clicked country:', properties.ADMIN);
	};
</script>

<div id="map"></div>

<style>
	#map {
		width: 100%;
		height: 500px;
	}
</style>
