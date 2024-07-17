import { Router } from 'express';

import { logger } from '../utils/logger.utils';
import { post } from '../controllers/event.controller';

const eventRouter: Router = Router();

eventRouter.post('/', async (req, res) => {
  try {
    logger.info('Event received ');
    res.status(200);
    res.send();
    await post(req);
  } catch (error) {
    logger.error(error);
    res.status(200);
    res.send();
  }
});

export default eventRouter;
