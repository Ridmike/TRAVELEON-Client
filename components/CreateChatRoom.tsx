import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";

const CreateChatRoom = async (sellerId: string, addPostName: string, timeId:string) => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const buyerId = currentUser.uid;

    // Fetch buyer's name from UsersForign collection
    const userDoc = await getDoc(doc(db, "usersForign", buyerId));
    const buyerName = userDoc.exists() ? userDoc.data()?.name || "Unknown Buyer" : "Unknown Buyer";

    // Check if chat room already exists
    const q = query(
      collection(db, "chatRooms"),
      where("buyerId", "==", buyerId),
      where("sellerId", "==", sellerId),
      where("timeId", "==", timeId)
    );
    const existingRooms = await getDocs(q);

    if (!existingRooms.empty) {
      const existingRoom = existingRooms.docs[0];
      return existingRoom.id;
    }

    // Create new chat room
    const newChatRoomRef = doc(collection(db, "chatRooms"));
    const chatRoomData = {
      buyerId,
      sellerId,
      buyerName,
      addPostName,
      timeId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(newChatRoomRef, chatRoomData);

    return newChatRoomRef.id;
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};

export default CreateChatRoom;
