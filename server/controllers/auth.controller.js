const config = require("../config/auth.config.js");
const User = require("../models/user.model.js");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const StreamChat = require('stream-chat').StreamChat;

const serverClient = StreamChat.getInstance('pjdytf96h8m6', 'uce6zjxe4sxy3fmwaw5ar88f8qjt5hjzax9hffsf5wmfrt4gyhdb6cm97nem4twt');

exports.signup = async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8),
            role: req.body.role
        });

        await user.save();
        res.status(201).send({ message: "User was registered successfully." });
    } catch (err) {
        res.status(500).send({ message: err.message || "Error occurred while registering the user." });
    }
}

exports.signin = async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid Password." });
        }

        const token = jwt.sign(
            { id: user.id },
            config.secret,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: 86400, // 24hrs
            }
        );

        const chatToken = serverClient.createToken(user._id.toString());

        req.session.token = token;
        req.session.username = user.username;

        res.status(200).send({
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            token: token,
            chatToken: chatToken,
            expiresIn: 86400
        });
    } catch (err) {
        res.status(500).send({ message: err.message || "Error occurred while logging in." });
    }
}

exports.signout = async (req, res) => {
    try {
        req.session = null;

        return res.status(200).send({ message: `User has been signed out.` });
    } catch (err) {
        this.next(err);
    }
};
