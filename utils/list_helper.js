
const dummy = (blogs) => {
    return 1
}
const totalLikes = (blogs) => {

return blogs.reduce((acc, curr) => acc + curr.likes,0)
}

const favoriteBlog =(blogs) => {
return  blogs.reduce((max, blog) => max.likes > blog.likes ? max : blog);

}
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}