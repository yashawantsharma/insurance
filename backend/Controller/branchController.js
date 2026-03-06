const branch = require("../Model/branchModel");

exports.addbranch = async (req, res) => {
    try {
        const { branchName, branchCode, address } = req.body;
        if (!(branchName && branchCode && address)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingbranch = await branch.findOne({ branchName });
        if (existingbranch) {
            return res.status(400).json({ message: "Branch already exists" });
        }

        const newbranch = new branch({ branchName, branchCode, address });
        await newbranch.save();
        res.status(200).json(newbranch);
    } catch (error) {
        res.status(400).json({ message: "branch no add" });
    }
};

exports.getAllBranch = async (req, res) => {
    try {
        const branches = await branch.find();
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const found = await branch.findById(id);
        if (!found) {
            return res.status(404).json({ message: "Branch not found" });
        }
        res.status(200).json(found);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updated = await branch.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Branch not found" });
        }
        res.status(200).json({ message: "Branch updated successfully", branch: updated });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await branch.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Branch not found" });
        }
        res.status(200).json({ message: "Branch deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};