<script lang="ts">
	import countries from '$lib/geojson/countries.json';
	import L, { type LeafletMouseEventHandlerFn } from 'leaflet';
	import 'leaflet/dist/leaflet.css';
	import flagCodesData from '$lib/codes/fr.json';

	$effect(() => {
		const map = L.map('map');
		map.setView([15, 0], 2);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 20
		}).addTo(map);

		//@ts-ignore
		L.geoJSON(countries.features, {
			onEachFeature: (feature, layer) => {
				layer.on({
					click: handleClick
				});
			}
		}).addTo(map);
	});

	const handleClick: LeafletMouseEventHandlerFn = (e) => {
		console.log(e);

		const properties = e.target.feature
			.properties as (typeof countries)['features'][0]['properties'];
		console.log(
			'Clicked country:',
			//@ts-expect-error
			isNaN(properties.ISO_A2) ? flagCodesData[properties.ISO_A2.toLowerCase()] : properties.NAME
		);
	};
</script>

<div id="map"></div>

<style>
	#map {
		width: 100%;
		height: 500px;
	}
</style>
