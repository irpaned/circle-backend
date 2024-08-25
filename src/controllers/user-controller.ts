import { Request, Response } from "express";
import UserService from "../service/user-service";
import FollowService from "../service/follow-service";
import userService from "../service/user-service";

async function find(req: Request, res: Response) {
  try {
    const userLogged = res.locals.user;
    // const user = res.locals.user;
    const search = req.query.search as string; //  bikin const ( query string step 1)
    const users = await UserService.find(search, userLogged.id);
    const newUser = users
      .filter((user) => user.id !== userLogged.id)
      .map((user) => {
        const followers = user.followers;
        const followeds = user.followeds;
        return {
          ...user,
          isFollowed: followeds.some(
            (followed) => followed.followerId == userLogged.id
          ),
          isFollower: followers.some(
            (follower) => follower.followerId == userLogged.id
          ),
        };
      });

    return res.json(newUser);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function findMany(req: Request, res: Response) {
  try {
    const data = await userService.findMany();
    const loggedInUser = res.locals.user;

    const sanitizedUsers = data
      .filter((user) => user.id !== loggedInUser.id)
      .map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    res.status(200).json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function findOneProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await UserService.findOneProfile(Number(id));

    if (!user) {
      return res.status(404).json({ message: "User not found ya" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function updateProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const body = {
      ...req.body,
      photoProfile: req.file ? req.file.path : "",
    };

    // pengecekan
    const user = await UserService.findOneProfile(Number(id));
    if (!user)
      res.status(404).json({
        message: "Thread not found!",
      });

    // cundus
    const editedProfile = await UserService.updateProfile(Number(id), body);
    res.json(editedProfile);
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
}

async function follow(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = res.locals.user;
    const follow = await FollowService.follow(parseInt(id), user.id);

    return res.status(200).json(follow);
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
}

async function getDataFollowings(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // const user = res.locals.user;
    const data = await FollowService.FindAllFollowings(Number(id));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
}

async function getDataFollowers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // const user = res.locals.user;
    const data = await FollowService.FindAllFollowers(Number(id));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
}

async function CountDataFollowers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    // const user = res.locals.user;
    const data = await FollowService.CountFollowing(Number(id));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
}

export default {
  find,
  updateProfile,
  findOneProfile,
  follow,
  getDataFollowers,
  getDataFollowings,
  CountDataFollowers,
  findMany,
};
