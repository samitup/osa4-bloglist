
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')


beforeEach(async () => {
    await Blog.deleteMany({})

    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()

    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()
})


test('blogs are returned as json', async () => { //Tarkistaa ovatko palautetut blogit json muodossa
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})
test('all blogs are returned', async () => {    //Tarkistaa palautetaanko kaikki blogit
    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(helper.initialBlogs.length)
})
test('Blog id is in correct form', async () => { //Tarkistaa onko palautettava ID oikeassa muodossa
    const response = await api.get('/api/blogs')
    console.log(`ID: ${response.body.id}`)
    response.body.map(blog => expect(blog.id).toBeDefined())

})
test('a valid blog can be added', async () => { //Testaa onnistuuko blogin lisäys
    const newBlog = {
        title: 'For every action there is a REACTion',
        author: 'pena',
        url: 'www.balls.com',
        likes: 69
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(
        'For every action there is a REACTion'
    )
})
test('If blog has no likes, its value is set to 0', async () => { //Tarkistaa palauttaako 0 jos ei yhtään likeä annettu
    const newBlog = {
        title: 'Nobody likes me',
        author: 'Lone Wolf',
        url: 'www.foreveralone.com'
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
    const blogsAtEnd = await helper.blogsInDb()
    const added = blogsAtEnd.find(lastBlog => lastBlog.title === newBlog.title)
    expect(added.likes).toBe(0)
})
test('responds with status code 400 if no url or title given', async () => { //Tarkistaa palauttaako 400 bad request jos ei annettu title/url
    const newBlog = {
        author: 'I have no title and url',
        likes: 100
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
})
test('a specific blog is within the returned blogs', async () => { //Tarkistaa palauttaako tietyn blogin titlen perusteella
    const response = await api.get('/api/blogs')

    const title = response.body.map(r => r.title)
    expect(title).toContain(
        'React patterns'
    )
})

afterAll(() => {
    mongoose.connection.close()
})