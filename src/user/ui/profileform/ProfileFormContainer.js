import { drizzleConnect } from 'drizzle-react'
import ProfileForm from './ProfileForm'
import { updateUser } from './ProfileFormActions'

const mapStateToProps = (state, ownProps) => {
  return {
    name: state.user.data.name,
    bio: state.user.data.bio,
    drops: state.user.data.drops,
    imgUrl: state.user.data.imgUrl,
    followers: state.user.data.followers,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onProfileFormSubmit: (name, bio, buffer) => {
      dispatch(updateUser(name, bio, buffer))
    },
  }
}

const ProfileFormContainer = drizzleConnect(ProfileForm, mapStateToProps, mapDispatchToProps)

export default ProfileFormContainer
