import mongoose from 'mongoose';

const otpschema = new mongoose.Schema(
    {
        phonenumber: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        otpexpiry: {
            type: Date,
            default: Date.now,
            get: (otpexpiry) => otpexpiry.getTime(),
            set: (otpexpiry) => new Date(otpexpiry),
        },
    },
    {
        timestamps: true,
    }
);

const OTPmodel = mongoose.model('OTP', otpschema);

export default OTPmodel;
