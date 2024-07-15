import { Router } from 'express';

import { logger } from '../utils/logger.utils';
import { post } from '../controllers/event.controller';

const eventRouter: Router = Router();

eventRouter.post('/', async (req, res) => {
  try {
    logger.info('Event received ');
    await post(req);
    res.status(200);
    res.send();
  } catch (error) {
    logger.error(error);
    res.status(200);
    res.send();
  }
});

export default eventRouter;
