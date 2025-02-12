import { Router, Request, Response } from 'express';
import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';


const router = Router();

// TODO: POST Request with city name to retrieve weather data
router.post('/', (req: Request, res: Response) => {
  // TODO: GET weather data from city name
  // TODO: save city to search history
  try{
    const { cityName } = req.body;
    WeatherService.getWeatherForCity(cityName).then((forecast) => {
      HistoryService.addCity(cityName);
      res.status(200).json(forecast);
    })
  }catch(err){}
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try{
    const cities = await HistoryService.getCities();
    res.status(200).json(cities);
  }catch(err){
    console.log(err);
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ msg: 'City ID is required' });
    }

    // Remove city from search history
    await HistoryService.removeCity(id);
    return res.json({ success: `City with ID ${id} removed from search history` });
    
  } catch (err) {
    console.error("Error deleting city from search history:", err);
    return res.status(500).json({ error: 'Failed to remove city from search history' });
  }
});




export default router;
