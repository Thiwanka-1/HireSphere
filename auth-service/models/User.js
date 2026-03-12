import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Please provide a name'] 
    },
    email: { 
        type: String, 
        required: [true, 'Please provide an email'], 
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: { 
        type: String, 
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // This ensures the password isn't accidentally returned in API responses
    },
    role: { 
        type: String, 
        enum: ['seeker', 'employer', 'admin'], 
        default: 'seeker' 
    },
    isActive: { 
        type: Boolean, 
        default: true // Admins can flip this to false to ban/deactivate users
    },
    
    // --- Employer Specific Fields ---
    // These are not required by default, but our registration controller 
    // will enforce them if the role is 'employer'
    companyName: { 
        type: String 
    },
    companyWebsite: { 
        type: String 
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// DevSecOps Best Practice: Hash password securely before saving to database
userSchema.pre('save', async function() {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return; // Just return, Mongoose 8 handles the promise automatically
    }
    
    // Generate a secure salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare passwords during login
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);