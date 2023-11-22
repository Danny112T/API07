const User = require("../models/users.model");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await User.countDocuments();
    const usuarios = await User.find().skip(skip).limit(limit);

    if (!usuarios) {
      res.status(404).json({
        estado: 0,
        mensaje: "Usuarios no encontrados",
      });
    }
    const totalDePaginas = Math.ceil(total / limit);

    res.status(200).json({
      estado: 1,
      mensaje: "Usuarios obtenidos correctamente",
      data: usuarios,
      totalDePaginas: totalDePaginas,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ estado: 0, mensaje: "Ocurrio un error desconocido" });
  }
};

exports.getUserByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    if (email == undefined) {
      return res.status(400).json({
        estado: 0,
        mensaje: "Falta el email",
        datos: null,
      });
    } else {
      const usuario = await User.findOne({ email: email }).exec();
      if (!usuario) {
        res.status(404).json({
          estado: 0,
          mensaje: "Usuario no encontrado",
          data: null,
        });
      } else {
        res.status(200).json({
          estado: 1,
          mensaje: "Usuario obtenido correctamente",
          data: usuario,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      estado: 0,
      mensaje: "Ocurrio un error desconocido",
    });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, lastname, user, email, svpassword } = req.body;
    if (
      name == undefined ||
      lastname == undefined ||
      user == undefined ||
      email == undefined ||
      svpassword == undefined
    ) {
      res.status(400).json({
        estado: 0,
        mensaje: "Faltan datos",
        datos: null,
      });
    } else {
      const existingUser = await User.findOne({
        $or: [{ user: user }, { email: email }],
      });
      if (existingUser) {
        res.status(400).json({
          estado: 0,
          mensaje: "Usuario o correo ya existente",
          datos: null,
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(svpassword, salt);
        const newUser = await User.create({
          name,
          lastname,
          user,
          email,
          password,
        });
        if (newUser) {
          res.status(201).json({
            estado: 1,
            mensaje: "Usuario creado correctamente",
            datos: newUser,
          });
        } else {
          res.status(500).json({
            estado: 0,
            mensaje: "Error al crear el usuario",
            datos: null,
          });
        }
      }
    }
  } catch (error) {
    res.status(400).json({
      estado: 0,
      mensaje: "Ocurrio un error desconocido",
      datos: null,
    });
    console.log(error);
  }
};

exports.updateUser = async (req, res) => {
  const { email } = req.params;
  const { name, lastname, user, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({
        estado: 0,
        mensaje: "No se encontró un usuario con ese correo electrónico",
        datos: null,
      });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      existingUser.password = hashedPassword;
    }

    existingUser.name = name || existingUser.name;
    existingUser.lastname = lastname || existingUser.lastname;
    existingUser.user = user || existingUser.user;

    const updatedUser = await existingUser.save();

    res.status(200).json({
      estado: 1,
      mensaje: "Usuario actualizado correctamente",
      datos: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ estado: 0, mensaje: "Ocurrió un error desconocido" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { email } = req.params;
    if ( email == undefined ) {
      res.status(400).json({
        estado: 0,
        mensaje: "Falta el email",
        datos: null,
      });
    } else {
        const usuario = await User.findOne({ email: email }).exec();
        if (!usuario) {
          res.status(404).json({
            estado: 0,
            mensaje: "Usuario no encontrado",
            data: null,
          });
        } else {
            User.findOneAndDelete({ email: email }).exec();
            res.status(200).json({
                estado: 1,
                mensaje: "Usuario eliminado correctamente",
                data: usuario,
            });
        }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      estado: 0,
      mensaje: "Ocurrio un error desconocido",
    });
  }
};
