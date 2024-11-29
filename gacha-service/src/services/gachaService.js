const GachaData = require("../models/GachaData");
const Item = require("../models/Item");
const ItemSet = require("../models/ItemSet");
const admin = require('firebase-admin');
const bucket = admin.storage().bucket();
exports.createGachaData = async (files, items, itemSets) => {
  try {

    // Lưu các item vào MongoDB và thu thập các ID của chúng
    const itemIds = [];
    for (const itemData of items) {
      const newItem = new Item({
        img: "a",
        name: itemData.name,
        description: itemData.description,
        ratio: itemData.ratio
      });
      await newItem.save();
      itemIds.push(newItem._id); // Lưu lại ID của item
    }
    // Lưu ảnh cho từng item và cập nhật URL vào MongoDB
    for (let i = 0; i < items.length; i++) {
        const file = files[`img_${i + 1}`]; // Giả sử các ảnh được đặt tên tuần tự img_item_1, img_item_2, ...
        if (file) {
        console.log(`Uploading image ${i + 1}...`);
        
        const imageUrl = await this.uploadImage(file[0], itemIds[i]); // Tải lên ảnh và nhận URL
        await Item.updateOne({ _id: itemIds[i] }, { $set: { img: imageUrl } }); // Cập nhật item với URL của ảnh
        }
    }

    // Tạo itemSets, mỗi itemSet sẽ chứa ID của các item đã được lưu
    const itemSetIds = [];
    for (const setData of itemSets) {
      const newItemSet = new ItemSet({
        name: setData.name,
        description: setData.description,
        items: setData.items.map(index => itemIds[index]) // Lấy ID của item theo chỉ số
      });
      await newItemSet.save();
      itemSetIds.push(newItemSet._id); // Lưu lại ID của itemSet
    }

    // Tạo dữ liệu gacha
    const newGachaData = new GachaData({
      items: itemIds, // Lưu ID của items
      itemSets: itemSetIds // Lưu ID của itemSets
    });

    // Lưu gachaData vào MongoDB
    await newGachaData.save();

    return newGachaData._id;
  } catch (error) {
    throw new Error('Error creating gacha data: ' + error.message);
  }
};

exports.uploadImage = (file,id) => {
    return new Promise((resolve, reject) => {
      try {
        console.log(file.originalname)
        const filepath = `images/items` + '/' + `${id}_${file.originalname}`;
        const blob = bucket.file(filepath);
        const blobStream = blob.createWriteStream({
          resumable: false,
          metadata: {
            contentType: file.mimetype,
          },
        });
  
        blobStream.on('error', err => {
          console.error(err);
          reject('Error uploading file.');
        });
  
        blobStream.on('finish', () => {
          blob.getSignedUrl({
            action: 'read',
            expires: '12-12-2024'
          }, (err, signedUrl) => {
            if (err) {
              console.error('Error getting signed URL:', err);
              reject('Error getting file URL.');
            }
            console.log('File uploaded successfully.');
            resolve(signedUrl);
          });
        });
  
        blobStream.end(file.buffer);
      } catch (error) {
        console.error(error);
        reject('Error during file upload.');
      }
    });
  };
  exports.getItemsByGameId = async (gameId) => {
    try {
      // Tìm GachaData dựa trên gameId
      const gachaData = await GachaData.findOne({ _id: gameId });
  
      if (!gachaData) {
        throw new Error("Gacha data not found for this game.");
      }
  
      // Lấy danh sách các item dựa trên IDs từ gachaData.items
      const items = await Item.find({ _id: { $in: gachaData.items } });
  
      if (!items || items.length === 0) {
        throw new Error("No items found for this game.");
      }
  
      return items;
    } catch (error) {
      throw error;
    }
  };
  exports.getItemSetId = async (itemSetId) => {
    try {
      const itemSet = await ItemSet.findOne({ _id: itemSetId });

      return itemSet;
    } catch (error) {
      throw error;
    }
  };
  exports.getItemSetsByGameId =  async (gameId) => {
    try {
      // Tìm GachaData dựa trên gameId
      const gachaData = await GachaData.findOne({ _id: gameId });
  
      if (!gachaData) {
        throw new Error("Gacha data not found for this game.");
      }
  
      // Lấy danh sách các item dựa trên IDs từ gachaData.items
      const items = await ItemSet.find({ _id: { $in: gachaData.itemSets } });
  
      if (!items || items.length === 0) {
        throw new Error("No items found for this game.");
      }
  
      return items;
    } catch (error) {
      throw error;
    }
  };
  exports.editGachaData = async (gachaDataId, files, items, itemSets) => {
    console.log("-------------------------------------")
    console.log(files)
    console.log(items)
    try {
      // Tìm gacha data theo ID
      const gachaData = await GachaData.findById(gachaDataId);
      if (!gachaData) {
        throw new Error('Gacha data not found');
      }
  
      // Cập nhật các item
      const itemIds = [];
      for (let i = 0; i < items.length; i++) {
        const itemData = items[i];
  
        // Kiểm tra nếu item đã tồn tại, thì cập nhật, nếu không thì tạo mới
        let item = await Item.findById(itemData._id);
        if (item) {
          item.name = itemData.name;
          item.description = itemData.description;
          item.ratio = itemData.ratio;
          await item.save();
        } else {
          item = new Item({
            img: "a",
            name: itemData.name,
            description: itemData.description,
            ratio: itemData.ratio,
          });
          await item.save();
        }
        itemIds.push(item._id);
      }
  
      // Lưu ảnh cho từng item và cập nhật URL vào MongoDB
      if(files) {
        for (let i = 0; i < items.length; i++) {
          const file = files[`img_${i + 1}`]; // Giả sử các ảnh được đặt tên tuần tự img_1, img_2, ...
          if (file) {
            console.log(`Uploading image ${i + 1}...`);
            const imageUrl = await this.uploadImage(file[0], itemIds[i]); // Tải lên ảnh và nhận URL
            await Item.updateOne({ _id: itemIds[i] }, { $set: { img: imageUrl } }); // Cập nhật item với URL của ảnh
          }
        }
      }
     
  
      // Cập nhật các itemSets
      const itemSetIds = [];
      for (const setData of itemSets) {
        let itemSet = await ItemSet.findById(setData._id);
  
        if (itemSet) {
          itemSet.name = setData.name;
          itemSet.description = setData.description;
          itemSet.items = setData.items.map(index => itemIds[index]);
          await itemSet.save();
        } else {
          itemSet = new ItemSet({
            name: setData.name,
            description: setData.description,
            items: setData.items.map(index => itemIds[index]),
          });
          await itemSet.save();
        }
  
        itemSetIds.push(itemSet._id);
      }
  
      // Cập nhật gacha data với các item và itemSets mới
      gachaData.items = itemIds;
      gachaData.itemSets = itemSetIds;
  
      // Lưu gachaData đã cập nhật vào MongoDB
      await gachaData.save();
  
      return gachaData._id;
    } catch (error) {
      throw new Error('Error updating gacha data: ' + error.message);
    }
  };
  