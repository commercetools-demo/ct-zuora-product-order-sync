import { Router } from 'express';

import { logger } from '../utils/logger.utils';
import { post } from '../controllers/event.controller';

const eventRouter: Router = Router();

eventRouter.post('/', async (req, res) => {
  logger.info('Event received ');
  res.status(200);
  res.send();
  try {
    await post(req);
  } catch (error) {
    logger.error(error);
  }
});

export default eventRouter;
