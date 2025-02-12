import fs from "node:fs/promises";

// TODO: Define a City class with name and id properties
class City {
  name: string;
  id: string;
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}
// TODO: Complete the HistoryService class
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    return await fs.readFile("db/db.json", {flag: 'a+',
      encoding: 'utf8',})
  }

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    return await fs.writeFile("db/db.json", JSON.stringify(cities))
  }

  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    const data = await this.read()
    return JSON.parse(data || "[]")
  }

  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    const newCity = new City(city, Math.random().toString(36).substr(2, 9))
    const cities = await this.getCities()
    cities.push(newCity)
    await this.write(cities)
  }

  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    try {
      const cities = await this.getCities();
      const filteredCities = cities.filter((city: City) => city.id !== id);

      if (filteredCities.length === cities.length) {
        throw new Error(`City with ID ${id} not found`);
      }

      await this.write(filteredCities);
    } catch (error) {
      console.error("Error removing city:", error);
      throw error;
    }
  }
}
  

export default new HistoryService();
