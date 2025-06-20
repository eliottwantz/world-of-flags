import type { Country, Language } from "./types";

const COUNTRIES_API_URL =
	"https://restcountries.com/v3.1/all?fields=name,flags,cca2,cca3,translations";

let countriesCache: Country[] | null = null;

export function getCountryName(country: Country, language: Language): string {
	if (language === "fr" && country.translations?.fra?.common) {
		return country.translations.fra.common;
	}
	return country.name.common;
}

export async function fetchCountries(): Promise<Country[]> {
	if (countriesCache) {
		return countriesCache;
	}

	try {
		const response = await fetch(COUNTRIES_API_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch countries: ${response.statusText}`);
		}

		const countries: Country[] = await response.json();

		// Filter out countries without proper flag images
		countriesCache = countries.filter(
			(country) =>
				country.flags?.svg &&
				country.name?.common &&
				country.flags.svg.includes("flagcdn.com"),
		);

		return countriesCache;
	} catch (error) {
		console.error("Error fetching countries:", error);
		throw error;
	}
}

export function getRandomCountries(
	countries: Country[],
	count: number,
	exclude: string[] = [],
): Country[] {
	const availableCountries = countries.filter(
		(country) => !exclude.includes(country.cca3),
	);

	const shuffled = [...availableCountries].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

export function generateGameQuestions(
	countries: Country[],
	questionCount = 10,
	language: Language = "en",
): Array<{
	country: Country;
	options: Country[];
	correctAnswer: string;
}> {
	const usedCountries: string[] = [];
	const questions = [];

	for (let i = 0; i < questionCount; i++) {
		// Get a random country for the question that hasn't been used
		const availableCountries = countries.filter(
			(country) => !usedCountries.includes(country.cca3),
		);

		if (availableCountries.length === 0) break;

		const correctCountry =
			availableCountries[Math.floor(Math.random() * availableCountries.length)];
		usedCountries.push(correctCountry.cca3);

		// Get 5 random incorrect options
		const incorrectOptions = getRandomCountries(countries, 5, [
			correctCountry.cca3,
			...usedCountries,
		]);

		// Combine correct answer with incorrect options and shuffle
		const allOptions = [correctCountry, ...incorrectOptions];
		const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

		questions.push({
			country: correctCountry,
			options: shuffledOptions,
			correctAnswer: getCountryName(correctCountry, language),
		});
	}

	return questions;
}
