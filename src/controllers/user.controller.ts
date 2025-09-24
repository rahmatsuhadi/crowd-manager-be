import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { ChangeUserPasswordInput, CreateUserInput, GetUsersQueryInput, UpdateUserInput } from '../schemas/user.schema';
import { Prisma, User } from '@prisma/client';

export async function createUserController(
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(409).json({ status: 'fail', message: error.message });
    }
    else if (error instanceof Error) {
      return res.status(409).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
}


export async function getAllUsersController(
  req: Request<{}, {}, {}, GetUsersQueryInput>,
  res: Response,
  next: NextFunction
) {
  try {
    // Mengambil dan mem-parsing query params
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '10');
    const search = req.query.search;

    const result = await userService.getAllUsers({ page, limit, search });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUserByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserController(
  req: Request<{ id: string }, {}, UpdateUserInput>,
  res: Response,
  next: NextFunction
) {
  try {

    const currentUser = req.user as User
    const isOwn = currentUser.id == req.params.id

    if (!!isOwn && !!req.body.role) {
      res.status(403).json({ message: "Request Not Allowed" });
      throw new Error();
    }


    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}


export async function changePasswordUserController(
  req: Request<{ id: string }, {}, ChangeUserPasswordInput>,
  res: Response,
  next: NextFunction
) {
  try {

    const user = await userService.changePassword(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const currentUser = req.user as User
    const isOwn = currentUser.id == req.params.id

    if (isOwn) {
      res.status(403).json({ message: "Request Not Allowed" });
      throw new Error();
    }

    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}


export async function getUserOverviewController(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await userService.getUserOverviewStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}