import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
    },
    title: {
      type: String,
      required: [true, "Invoice title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Invoice amount is required"],
      min: [0, "Invoice amount cannot be negative"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["Paid", "Unpaid", "Overdue"],
        message: "{VALUE} is not a valid invoice status",
      },
      default: "Unpaid",
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "",
    },
    transactionId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for query optimization
invoiceSchema.index({ studentId: 1, status: 1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);
export default Invoice;
