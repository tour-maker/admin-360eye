import React, { useState } from "react";
import AlbumManage from "../../components/album/AlbumManage";
import AddAlbum from "../../components/album/AddAlbum";
import logo2 from "../../assets/images/360eye_logo 4.png";

const AlbumPage = () => {

  const [isEditing, setIsEditing] = useState(false); // Track if we're in edit mode
  const [currentAlbum, setCurrentAlbum] = useState(null); // Store the album being edited
  const [reload, setReload] = useState(false); // State to trigger re-fetch
  
  const handleSuccess = () => {
    setReload((prev) => !prev); // Toggle state to trigger re-fetch
  };
  
  return (
    <div className="bg-secondary-100 flex flex-col relative">
      {/* Logo */}
      <img src={logo2} alt="logo" className="absolute right-9 top-6" />
      
      {/* Add/Edit Album Form */}
      <AddAlbum
        isEditing={isEditing} // Pass edit mode state
        currentAlbum={currentAlbum} // Pass the album being edited
        onCancelEdit={() => {
          setIsEditing(false); // Exit edit mode
          setCurrentAlbum(null); // Clear the current album
        }}
        onSuccess={handleSuccess} // Trigger re-fetch on success
      />

      {/* Album Management Table */}
      <AlbumManage
        reload={reload} // Pass reload state to trigger re-fetch
        onEditAlbum={(album) => {
          setIsEditing(true); // Enter edit mode
          setCurrentAlbum(album); // Set the album being edited
        }}
      />
    </div>
  );
};

export default AlbumPage;