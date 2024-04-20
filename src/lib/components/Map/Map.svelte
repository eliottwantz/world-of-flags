<script lang="ts">
	import type { GeoJsonObject } from 'geojson';
	import L from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import type { MouseEventHandler } from 'svelte/elements';

	let map = $state<L.Map | undefined>(undefined);

	$effect(() => {
		const mapL = L.map('map');
		mapL.setView([15, 0], 2);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 20
		}).addTo(mapL);

		map = mapL;
	});

	const handleClick: MouseEventHandler<HTMLDivElement> = (event) => {
		if (!map) return;
		const latlng = map.mouseEventToLatLng(event);
		// Here you would compare latlng with the coordinates of each country
		// to determine which country was clicked and provide appropriate feedback.
		console.log('Clicked at:', latlng);
	};
</script>

<div id="map" onclick={handleClick}></div>

<style>
	#map {
		width: 100%;
		height: 500px;
	}
</style>
