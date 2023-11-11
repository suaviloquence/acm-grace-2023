export interface Event {
	id: number;
	eventName: string;
	owner: string;
	start: number;
	end: number;
	location_lat: number;
	location_lon: number;
}