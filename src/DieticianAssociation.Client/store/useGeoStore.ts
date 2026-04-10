"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "@/hooks/use-toast";
import {
  getDieticianAssociationAPI,
  type CountryDto,
  type StateDto,
  type CityDto,
} from "../services/generated";
import { handleError, cachedFetch } from "./storeUtils";

const GEO_CACHE_TTL = 5 * 60_000; // 5 minutes

interface GeoState {
  countries: CountryDto[];
  states: StateDto[];
  cities: CityDto[];
  loading: boolean;
  error: string | null;
  
  // Selected values for cascading dropdowns
  selectedCountryId: number | null;
  selectedStateId: number | null;
  selectedCityId: number | null;

  // Actions
  fetchCountries: () => Promise<CountryDto[]>;
  fetchStatesByCountry: (countryId: number) => Promise<StateDto[]>;
  fetchCitiesByState: (stateId: number) => Promise<CityDto[]>;
  fetchCitiesByCountry: (countryId: number) => Promise<CityDto[]>;
  
  // Selection actions
  setSelectedCountry: (countryId: number | null) => void;
  setSelectedState: (stateId: number | null) => void;
  setSelectedCity: (cityId: number | null) => void;
  
  // Utility actions
  removeError: () => void;
  reset: () => void;
}

const api = getDieticianAssociationAPI();

export const useGeoStore = create<GeoState>()(
  devtools((set, get) => ({
    countries: [],
    states: [],
    cities: [],
    loading: false,
    error: null,
    selectedCountryId: null,
    selectedStateId: null,
    selectedCityId: null,

    fetchCountries: async () => {
      if (get().countries.length > 0) return get().countries;
      set({ loading: true, error: null });
      try {
        const countries = await cachedFetch<CountryDto[]>(
          'geo:countries',
          async () => {
            const res = await api.getApiGeoCountries();
            return (res.data as CountryDto[]) || [];
          },
          GEO_CACHE_TTL
        );
        set({ countries, loading: false });
        return countries;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Error", description: error, variant: "error" });
        throw err;
      }
    },

    fetchStatesByCountry: async (countryId: number) => {
      set({ loading: true, error: null });
      try {
        const states = await cachedFetch<StateDto[]>(
          `geo:states:${countryId}`,
          async () => {
            const res = await api.getApiGeoCountriesCountryIdStates(countryId);
            return (res.data as StateDto[]) || [];
          },
          GEO_CACHE_TTL
        );
        set({ states, loading: false });
        return states;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Error", description: error, variant: "error" });
        throw err;
      }
    },

    fetchCitiesByState: async (stateId: number) => {
      set({ loading: true, error: null });
      try {
        const cities = await cachedFetch<CityDto[]>(
          `geo:cities:state:${stateId}`,
          async () => {
            const res = await api.getApiGeoStatesStateIdCities(stateId);
            return (res.data as CityDto[]) || [];
          },
          GEO_CACHE_TTL
        );
        set({ cities, loading: false });
        return cities;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Error", description: error, variant: "error" });
        throw err;
      }
    },

    fetchCitiesByCountry: async (countryId: number) => {
      set({ loading: true, error: null });
      try {
        const cities = await cachedFetch<CityDto[]>(
          `geo:cities:country:${countryId}`,
          async () => {
            const res = await api.getApiGeoCountriesCountryIdCities(countryId);
            return (res.data as CityDto[]) || [];
          },
          GEO_CACHE_TTL
        );
        set({ cities, loading: false });
        return cities;
      } catch (err) {
        const error = handleError(err);
        set({ error, loading: false });
        toast({ title: "Error", description: error, variant: "error" });
        throw err;
      }
    },

    setSelectedCountry: (countryId: number | null) => {
      set({ 
        selectedCountryId: countryId,
        selectedStateId: null,
        selectedCityId: null,
        states: [],
        cities: []
      });
      
      // Automatically fetch states when country is selected
      if (countryId !== null) {
        get().fetchStatesByCountry(countryId);
      }
    },

    setSelectedState: (stateId: number | null) => {
      set({ 
        selectedStateId: stateId,
        selectedCityId: null,
        cities: []
      });
      
      // Automatically fetch cities when state is selected
      if (stateId !== null) {
        get().fetchCitiesByState(stateId);
      }
    },

    setSelectedCity: (cityId: number | null) => {
      set({ selectedCityId: cityId });
    },

    removeError: () => set({ error: null }),
    
    reset: () =>
      set({
        countries: [],
        states: [],
        cities: [],
        loading: false,
        error: null,
        selectedCountryId: null,
        selectedStateId: null,
        selectedCityId: null,
      }),
  }))
);
