const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DEFAULT_USER_ID = 1;

// Get user profile
const getUserProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
      include: {
        addresses: true,
        paymentCards: {
          select: {
            id: true,
            cardholderName: true,
            cardNumber: true,
            expiryMonth: true,
            expiryYear: true,
            isDefault: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Get all addresses
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: DEFAULT_USER_ID },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
};

// Create address
const createAddress = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, street, city, state, postalCode, country } = req.body;

    const address = await prisma.address.create({
      data: {
        userId: DEFAULT_USER_ID,
        fullName,
        phoneNumber,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: false,
      },
    });

    res.status(201).json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
};

// Update address
const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phoneNumber, street, city, state, postalCode, country, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: DEFAULT_USER_ID },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: parseInt(id) },
      data: {
        fullName,
        phoneNumber,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault || false,
      },
    });

    res.json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
};

// Delete address
const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.address.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};

// Get payment cards
const getPaymentCards = async (req, res, next) => {
  try {
    const cards = await prisma.paymentCard.findMany({
      where: { userId: DEFAULT_USER_ID },
      select: {
        id: true,
        cardholderName: true,
        cardNumber: true,
        expiryMonth: true,
        expiryYear: true,
        isDefault: true,
        createdAt: true,
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: cards });
  } catch (err) {
    next(err);
  }
};

// Create payment card
const createPaymentCard = async (req, res, next) => {
  try {
    const { cardholderName, cardNumber, expiryMonth, expiryYear, cvv } = req.body;

    const card = await prisma.paymentCard.create({
      data: {
        userId: DEFAULT_USER_ID,
        cardholderName,
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        isDefault: false,
      },
      select: {
        id: true,
        cardholderName: true,
        cardNumber: true,
        expiryMonth: true,
        expiryYear: true,
        isDefault: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: card });
  } catch (err) {
    next(err);
  }
};

// Set default payment card
const setDefaultPaymentCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.paymentCard.updateMany({
      where: { userId: DEFAULT_USER_ID },
      data: { isDefault: false },
    });

    const card = await prisma.paymentCard.update({
      where: { id: parseInt(id) },
      data: { isDefault: true },
      select: {
        id: true,
        cardholderName: true,
        cardNumber: true,
        expiryMonth: true,
        expiryYear: true,
        isDefault: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: card });
  } catch (err) {
    next(err);
  }
};

// Delete payment card
const deletePaymentCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.paymentCard.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Payment card deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getPaymentCards,
  createPaymentCard,
  setDefaultPaymentCard,
  deletePaymentCard,
};
