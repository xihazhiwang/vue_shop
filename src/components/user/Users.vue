<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区-->
    <el-card class="box-card">
      <!--搜索与添加区-->
      <el-row :gutter="20">
        <el-col>
          <el-col :span="7">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-col>
      </el-row>

      <!--用户列表区域-->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeUserById(scope.row.id)"></el-button>
            <!--分配角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!--添加用户对话框-->
      <el-dialog
        @close="addDialogClose"
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%">
        <!--内容主题区域-->
        <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!--修改用户对话框-->
      <el-dialog
        @close="editDialogClose"
        title="编辑用户"
        :visible.sync="editDialogVisible"
        width="50%">
        <!--内容主题区域-->
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username" disabled>
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>

      <!--分配角色对话框-->
      <el-dialog
        title="提示"
        :visible.sync="setRoleDialogVisible"
        width="50%">
        <div>
          <p>当前的用户: {{userInfo.username}}</p>
          <p>当前的角色: {{userInfo.role_name}}</p>
          <p>分配新角色：
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                @close="setRoleDialogClosed"
                v-for="item in rolesList" :key="item.id" :value="item.id" :label="item.roleName"/>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDIalogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Users',
    data () {
      // 验证邮箱的规则
      const checkEmail = (rule, value, cb) => {
        // 验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+()\.[a-zA-Z0-9_-]/
        if (regEmail.test(value)) {
          return cb()
        }
        return cb(new Error('请输入合法的邮箱'))
      }
      // 验证手机号的规则
      const checkMobile = (rule, value, cb) => {
        // 验证手机号的正则表达式
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return cb()
        }
        return cb(new Error('请输入合法的手机号'))
      }
      return {
        // 获取用户列表的参数对象
        queryInfo: {
          query: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 2
        },
        userList: [],
        total: 0,
        // 控制添加用户对话框的显示和隐藏
        addDialogVisible: false,
        // 控制修改用户对话框的显示和隐藏
        editDialogVisible: false,
        // 控制分配角色对话框的显示和隐藏
        setRoleDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 添加表单的验证规则对象
        addRules: {
          username: [
            { required: true, message: '请输入用户名', tigger: 'blur' },
            { min: 3, max: 10, message: '用户名的长度在3-10个之间' }
          ],
          password: [
            { required: true, message: '请输入密码', tigger: 'blur' },
            { min: 6, max: 15, message: '用户名的长度在6-15个之间' }
          ],
          email: [
            { required: true, message: '请输入邮箱', tigger: 'blur' },
            { validator: checkEmail, tigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机号', tigger: 'blur' },
            { validator: checkMobile, tigger: 'blur' }
          ]
        },
        editForm: {
          username: '',
          email: '',
          mobile: ''
        },
        // 添加表单的验证规则对象
        editRules: {
          email: [
            { required: true, message: '请输入邮箱', tigger: 'blur' },
            { validator: checkEmail, tigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机号', tigger: 'blur' },
            { validator: checkMobile, tigger: 'blur' }
          ]
        },
        rolesList: [],
        userInfo: {},
        selectedRoleId: ''
      }
    },
    created () {
      this.getUserList()
    },
    methods: {
      async getUserList () {
        const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败')
        }
        this.userList = res.data.users
        this.total = res.data.total
      },
      // 监听pagesize改变的事件
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      // 监听页码值改变的事件
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      // 监听switch开关状态的改变
      async userStateChange (userInfo) {
        const { data: res } = await this.$http.put(`/users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          this.$message.error('更新用户状态失败')
        } else {
          this.$message.success('更新用户状态成功')
        }
      },
      addDialogClose () {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮添加新用户
      addUser () {
        this.$refs.addFormRef.validate(async valid => {
          if (valid) {
            const { data: res } = await this.$http.post('/users', this.addForm)
            if (res.meta.status !== 201) {
              return this.$message.error('添加用户失败')
            }
            this.$message.success('添加用户成功')
            this.addDialogVisible = false
            this.getUserList()
          }
        })
      },
      // 展示编辑用户对话框
      async showEditDialog (id) {
        const { data: res } = await this.$http.get(`/users/${id}`)
        if (res.meta.status !== 200) this.$message.error('查询用户信息失败')
        this.editForm = res.data
        this.editDialogVisible = true
      },
      // 编辑用户
      editUser () {
        this.$refs.editFormRef.validate(async valid => {
          if (valid) {
            const { data: res } = await this.$http.put(`/users/${this.editForm.id}`, {
              email: this.editForm.email,
              mobile: this.editForm.mobile
            })

            if (res.meta.status !== 200) {
              return this.$message.error('更新用户信息失败')
            }
            this.$message.success('更新用户信息成功')
            this.editDialogVisible = false
            this.getUserList()
          }
        })
      },
      editDialogClose () {
        this.$refs.editFormRef.resetFields()
      },
      // 根据id删除用户信息
      async removeUserById (id) {
        // 询问用户是否删除
        const confirmResult = await this.$confirm('此操作将永久删除改用户，是否继续', '提示', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已经取消了删除')
        } else {
          const { data: res } = await this.$http.delete(`/users/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          this.$message.success('删除成功')
          this.getUserList()
        }
      },
      async getRolesList () {
        const { data: res } = await this.$http.get('/roles')
        if (res.meta.status !== 200) {
          return this.$message.error('权限获取失败')
        }
        this.rolesList = res.data
      },
      async setRole (userInfo) {
        this.userInfo = userInfo
        // 获取所有的角色列表
        const { data: res } = await this.$http.get('/roles')
        if (res.meta.status !== 200) {
          return this.$message.error('失败')
        }

        this.rolesList = res.data
        this.setRoleDialogVisible = true
      },
      async saveRoleInfo () {
        if (!this.selectedRoleId) {
          this.$message.error('请选择一个具体的角色')
        }
        const { data: res } = await this.$http.put(`/users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败')
        }
        this.$message.success('更新角色成功')
        this.getUserList()
        this.setRoleDialogVisible = false
      },
      setRoleDialogClosed () {
        this.selectedRoleId = ''
        this.userInfo = {}
      }
    }
  }
</script>

<style scoped>

</style>
